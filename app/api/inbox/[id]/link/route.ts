import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api/http";
import { eventDefaultTitles } from "@/lib/applications/status";
import { createRouteSupabaseClient } from "@/lib/supabase/server";
import type { EventType, LinkInboxRequest } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await readJson<LinkInboxRequest>(request);
  const inboxItemId = body.inboxItemId || id;

  const { data: inboxItem, error: inboxError } = await supabase
    .from("inbox_items")
    .select("*")
    .eq("id", inboxItemId)
    .eq("user_id", user.id)
    .single();

  if (inboxError || !inboxItem) return jsonError(inboxError?.message ?? "Inbox item not found.", 404);

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", body.applicationId)
    .eq("user_id", user.id)
    .single();

  if (applicationError || !application) {
    return jsonError(applicationError?.message ?? "Application not found.", 404);
  }

  const eventType = (body.eventType ?? inboxItem.extracted_event_type ?? "other") as EventType;
  let linkedEventId: string | null = null;

  if (body.createEvent) {
    const { data: event, error: eventError } = await supabase
      .from("application_events")
      .insert({
        user_id: user.id,
        application_id: body.applicationId,
        inbox_item_id: inboxItemId,
        event_type: eventType,
        title: body.eventTitle || eventDefaultTitles[eventType],
        body: body.eventBody || inboxItem.summary || null,
        occurred_at: body.occurredAt || inboxItem.extracted_event_at || inboxItem.received_at,
        source: inboxItem.source,
        raw_text: inboxItem.raw_text
      })
      .select("id")
      .single();

    if (eventError) return jsonError(eventError.message, 500);
    linkedEventId = event.id;
  }

  if (body.updateApplicationStatus && body.newStatus) {
    const { error } = await supabase
      .from("applications")
      .update({
        status: body.newStatus,
        last_contact_at: inboxItem.received_at
      })
      .eq("id", body.applicationId)
      .eq("user_id", user.id);

    if (error) return jsonError(error.message, 500);
  } else {
    await supabase
      .from("applications")
      .update({ last_contact_at: inboxItem.received_at })
      .eq("id", body.applicationId)
      .eq("user_id", user.id);
  }

  if (body.createTodo && body.todoTitle) {
    const { error } = await supabase.from("todos").insert({
      user_id: user.id,
      application_id: body.applicationId,
      inbox_item_id: inboxItemId,
      title: body.todoTitle,
      due_at: body.todoDueAt || inboxItem.extracted_deadline_at || null
    });

    if (error) return jsonError(error.message, 500);
  }

  const { data: updatedInbox, error: updateInboxError } = await supabase
    .from("inbox_items")
    .update({
      status: "linked",
      linked_application_id: body.applicationId,
      linked_event_id: linkedEventId
    })
    .eq("id", inboxItemId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateInboxError) return jsonError(updateInboxError.message, 500);
  return NextResponse.json({ inboxItem: updatedInbox, linkedEventId });
}
