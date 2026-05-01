import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/http";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { error: inboxError } = await supabase
    .from("inbox_items")
    .update({ raw_text: null })
    .eq("id", id)
    .eq("user_id", user.id);

  if (inboxError) return jsonError(inboxError.message, 500);

  const { error: eventError } = await supabase
    .from("application_events")
    .update({ raw_text: null })
    .eq("inbox_item_id", id)
    .eq("user_id", user.id);

  if (eventError) return jsonError(eventError.message, 500);
  return NextResponse.json({ ok: true });
}
