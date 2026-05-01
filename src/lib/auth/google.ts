"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const GOOGLE_GMAIL_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly"
].join(" ");

export async function startGoogleGmailLogin(next = "/dashboard") {
  const supabase = createBrowserSupabaseClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      scopes: GOOGLE_GMAIL_SCOPES,
      queryParams: {
        access_type: "offline",
        prompt: "consent"
      }
    }
  });
}
