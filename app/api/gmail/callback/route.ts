import { NextResponse } from "next/server";
import { exchangeGmailCode } from "@/lib/gmail/auth";
import { getGmailProfile } from "@/lib/gmail/client";
import { encryptToken } from "@/lib/security/tokens";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateUserId = url.searchParams.get("state");
  const origin = `${url.protocol}//${url.host}`;

  if (!code || !stateUserId) {
    return NextResponse.redirect(new URL("/settings/integrations?gmail=missing_code", origin));
  }

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.id !== stateUserId) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  try {
    const token = await exchangeGmailCode(code);
    const profile = await getGmailProfile(token.access_token);
    const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();

    const payload = {
        user_id: user.id,
        provider: "gmail",
        email: profile.emailAddress,
        access_token_encrypted: encryptToken(token.access_token),
        token_expires_at: expiresAt,
        sync_enabled: true
      };
    const accountPayload = token.refresh_token
      ? { ...payload, refresh_token_encrypted: encryptToken(token.refresh_token) }
      : payload;

    await supabase.from("email_accounts").upsert(
      accountPayload,
      { onConflict: "user_id,provider,email" }
    );

    return NextResponse.redirect(new URL("/settings/integrations?gmail=connected", origin));
  } catch {
    return NextResponse.redirect(new URL("/settings/integrations?gmail=failed", origin));
  }
}
