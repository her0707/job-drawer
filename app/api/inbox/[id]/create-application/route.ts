import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api/http";
import { eventDefaultTitles, eventSuggestedTodo } from "@/lib/applications/status";
import { createRouteSupabaseClient } from "@/lib/supabase/server";
import type { ApplicationChannel, ApplicationStatus, EventType } from "@/types/domain";

export const dynamic = "force-dynamic";

type CreateApplicationFromInboxRequest = {
  company?: string;
  role?: string;
  channel?: ApplicationChannel;
  status?: ApplicationStatus;
  createTodo?: boolean;
  todoTitle?: string;
  todoDueAt?: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await readJson<CreateApplicationFromInboxRequest>(request);

  const { data: inboxItem, error: inboxError } = await supabase
    .from("inbox_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (inboxError || !inboxItem) return jsonError(inboxError?.message ?? "Inbox item not found.", 404);
  if (inboxItem.status === "linked") return jsonError("이미 지원 건에 연결된 수신함 항목입니다.", 409);

  const company = normalizeText(body.company) || inboxItem.extracted_company || "";
  const role = normalizeText(body.role) || inboxItem.extracted_role || "포지션 미확인";
  const eventType = (inboxItem.extracted_event_type ?? "other") as EventType;
  const status = body.status ?? inboxItem.suggested_status ?? "applied";

  if (!company) return jsonError("회사명을 입력해주세요.");

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      company,
      role,
      channel: body.channel ?? "other",
      status,
      applied_at: eventType === "application_submitted" ? inboxItem.received_at : null,
      deadline_at: null,
      last_contact_at: inboxItem.received_at,
      priority: 3,
      next_action: inboxItem.extracted_action_required,
      next_action_due_at: inboxItem.extracted_deadline_at,
      memo: inboxItem.summary ? `수신함에서 생성됨: ${inboxItem.summary}` : "수신함에서 생성됨"
    })
    .select("*")
    .single();

  if (applicationError || !application) {
    return jsonError(applicationError?.message ?? "지원 건 생성에 실패했습니다.", 500);
  }

  const { data: event, error: eventError } = await supabase
    .from("application_events")
    .insert({
      user_id: user.id,
      application_id: application.id,
      inbox_item_id: inboxItem.id,
      event_type: eventType,
      title: eventDefaultTitles[eventType],
      body: inboxItem.summary,
      occurred_at: inboxItem.extracted_event_at ?? inboxItem.received_at,
      source: inboxItem.source,
      raw_text: inboxItem.raw_text
    })
    .select("*")
    .single();

  if (eventError || !event) return jsonError(eventError?.message ?? "이벤트 생성에 실패했습니다.", 500);

  const todoTitle =
    normalizeText(body.todoTitle) || inboxItem.extracted_action_required || eventSuggestedTodo[eventType] || "";
  let todo = null;

  if (body.createTodo && todoTitle) {
    const { data: createdTodo, error: todoError } = await supabase
      .from("todos")
      .insert({
        user_id: user.id,
        application_id: application.id,
        inbox_item_id: inboxItem.id,
        title: todoTitle,
        due_at: body.todoDueAt ?? inboxItem.extracted_deadline_at
      })
      .select("*")
      .single();

    if (todoError) return jsonError(todoError.message, 500);
    todo = createdTodo;
  }

  const { data: updatedInbox, error: updateInboxError } = await supabase
    .from("inbox_items")
    .update({
      status: "linked",
      linked_application_id: application.id,
      linked_event_id: event.id
    })
    .eq("id", inboxItem.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateInboxError) return jsonError(updateInboxError.message, 500);

  return NextResponse.json({ application, event, inboxItem: updatedInbox, todo }, { status: 201 });
}
