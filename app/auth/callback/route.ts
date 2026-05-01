import { NextResponse, type NextRequest } from "next/server";
import { getGmailProfile } from "@/lib/gmail/client";
import { encryptToken } from "@/lib/security/tokens";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (oauthError) {
    return NextResponse.redirect(new URL("/login?auth_error=google", requestUrl.origin));
  }

  if (code) {
    const supabase = await createRouteSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const session = data.session;
      const user = data.user;
      const providerToken = session?.provider_token;
      const providerRefreshToken = session?.provider_refresh_token;

      if (user && providerToken) {
        let email = user.email ?? null;

        if (!email) {
          try {
            const profile = await getGmailProfile(providerToken);
            email = profile.emailAddress;
          } catch {
            email = null;
          }
        }

        if (email) {
          const tokenPayload: {
            user_id: string;
            provider: string;
            email: string;
            access_token_encrypted: string;
            refresh_token_encrypted?: string;
            token_expires_at: string | null;
            sync_enabled: boolean;
          } = {
            user_id: user.id,
            provider: "gmail",
            email,
            access_token_encrypted: encryptToken(providerToken),
            token_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
            sync_enabled: true
          };

          if (providerRefreshToken) {
            tokenPayload.refresh_token_encrypted = encryptToken(providerRefreshToken);
          }

          await supabase.from("email_accounts").upsert(tokenPayload, {
            onConflict: "user_id,provider,email"
          });
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?auth_error=google", requestUrl.origin));
}
