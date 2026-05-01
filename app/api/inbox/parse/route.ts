import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api/http";
import { parseInboxText } from "@/lib/parser";
import { createRouteSupabaseClient } from "@/lib/supabase/server";
import type { InboxSource } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await readJson<{
    source: InboxSource;
    title?: string;
    sender?: string;
    rawText: string;
    receivedAt?: string;
    save?: boolean;
  }>(request);

  if (!body.rawText?.trim()) return jsonError("rawText is required.");

  const parsed = parseInboxText({
    source: body.source,
    title: body.title,
    sender: body.sender,
    rawText: body.rawText,
    receivedAt: body.receivedAt
  });

  if (!body.save) {
    return NextResponse.json({ parsed });
  }

  const { data, error } = await supabase
    .from("inbox_items")
    .insert({
      user_id: user.id,
      source: body.source,
      status: parsed.confidence < 0.55 ? "needs_review" : "pending",
      received_at: body.receivedAt || new Date().toISOString(),
      title: body.title || null,
      sender: body.sender || null,
      raw_text: body.rawText,
      extracted_company: parsed.extractedCompany,
      extracted_role: parsed.extractedRole,
      extracted_event_type: parsed.eventType,
      extracted_event_at: parsed.eventAt,
      extracted_deadline_at: parsed.deadlineAt,
      extracted_action_required: parsed.actionRequired,
      suggested_status: parsed.suggestedStatus,
      summary: parsed.summary,
      confidence: parsed.confidence,
      parsed_json: parsed as unknown as Record<string, unknown>
    })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ parsed, inboxItem: data }, { status: 201 });
}
