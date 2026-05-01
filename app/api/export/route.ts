import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/http";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const [applications, inboxItems, events, todos, qaEntries, documents] = await Promise.all([
    supabase.from("applications").select("*").eq("user_id", user.id),
    supabase.from("inbox_items").select("*").eq("user_id", user.id),
    supabase.from("application_events").select("*").eq("user_id", user.id),
    supabase.from("todos").select("*").eq("user_id", user.id),
    supabase.from("qa_entries").select("*").eq("user_id", user.id),
    supabase.from("documents").select("*").eq("user_id", user.id)
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    applications: applications.data ?? [],
    inboxItems: inboxItems.data ?? [],
    events: events.data ?? [],
    todos: todos.data ?? [],
    qaEntries: qaEntries.data ?? [],
    documents: documents.data ?? []
  });
}
