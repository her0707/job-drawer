import { createBrowserClient } from "@supabase/ssr";

function getSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  return { url, key };
}

export function createClient() {
  const { url, key } = getSupabaseBrowserEnv();
  return createBrowserClient(url, key);
}

export const createBrowserSupabaseClient = createClient;
