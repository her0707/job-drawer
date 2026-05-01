import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/http";
import { syncGmailAccount } from "@/lib/gmail/sync";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { data: account, error } = await supabase
    .from("email_accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "gmail")
    .eq("sync_enabled", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !account) return jsonError(error?.message ?? "Gmail account not found.", 404);

  try {
    const result = await syncGmailAccount(account);
    return NextResponse.json(result);
  } catch (syncError) {
    return jsonError(syncError instanceof Error ? syncError.message : "Gmail sync failed.", 500);
  }
}
