import { parseInboxText } from "@/lib/parser";
import { decryptToken, encryptToken } from "@/lib/security/tokens";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { refreshGmailAccessToken } from "./auth";
import {
  getGmailMessage,
  gmailRecruitingQueriesAfter,
  listGmailMessageIds,
} from "./client";
import { shouldStoreRecruitingMail } from "./recruitingFilter";

export type EmailAccount = {
  id: string;
  user_id: string;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  last_synced_at: string | null;
  created_at: string;
};

type GmailSyncResult = {
  fetchedCount: number;
  createdInboxCount: number;
};

type CronAccountSyncResult = {
  accountId: string;
  userId: string;
  status: "success" | "failed";
  fetchedCount: number;
  createdInboxCount: number;
  errorMessage?: string;
};

type CronGmailSyncSummary = {
  accountCount: number;
  successCount: number;
  failureCount: number;
  fetchedCount: number;
  createdInboxCount: number;
  results: CronAccountSyncResult[];
};

function toValidDate(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export async function syncGmailAccount(
  account: EmailAccount,
): Promise<GmailSyncResult> {
  if (!account.refresh_token_encrypted) {
    throw new Error("Missing Gmail refresh token.");
  }

  const supabase = createServiceSupabaseClient();
  const refreshToken = decryptToken(account.refresh_token_encrypted);
  const refreshed = await refreshGmailAccessToken(refreshToken);
  const accessToken = refreshed.access_token;
  const tokenExpiresAt = new Date(
    Date.now() + refreshed.expires_in * 1000,
  ).toISOString();
  const syncCursor = account.last_synced_at ?? account.created_at;
  const syncStartedAt = new Date().toISOString();

  await supabase
    .from("email_accounts")
    .update({
      access_token_encrypted: encryptToken(accessToken),
      token_expires_at: tokenExpiresAt,
    })
    .eq("id", account.id)
    .eq("user_id", account.user_id);

  const logResult = await supabase
    .from("email_sync_logs")
    .insert({
      user_id: account.user_id,
      email_account_id: account.id,
      status: "running",
    })
    .select("id")
    .single();

  const logId = logResult.data?.id;
  let fetchedCount = 0;
  let createdInboxCount = 0;

  try {
    const seen = new Set<string>();

    for (const query of gmailRecruitingQueriesAfter(syncCursor)) {
      const ids = await listGmailMessageIds(accessToken, query);

      for (const item of ids) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        fetchedCount += 1;

        const message = await getGmailMessage(accessToken, item.id);

        const cursorDate = toValidDate(syncCursor, new Date(0));
        const receivedAt = toValidDate(message.receivedAt, new Date());

        if (receivedAt < cursorDate) continue;

        const parsed = parseInboxText({
          source: "gmail",
          title: message.title ?? undefined,
          sender: message.sender ?? undefined,
          rawText: message.rawText,
          receivedAt: message.receivedAt ?? undefined,
        });

        if (!shouldStoreRecruitingMail(message, parsed)) continue;
        if (parsed.confidence < 0.4) continue;

        const { error } = await supabase.from("inbox_items").insert({
          user_id: account.user_id,
          source: "gmail",
          status: parsed.confidence < 0.55 ? "needs_review" : "pending",
          received_at: receivedAt.toISOString(),
          title: message.title,
          sender: message.sender,
          raw_text: message.rawText,
          provider: "gmail",
          provider_message_id: message.id,
          provider_thread_id: message.threadId,
          extracted_company: parsed.extractedCompany,
          extracted_role: parsed.extractedRole,
          extracted_event_type: parsed.eventType,
          extracted_event_at: parsed.eventAt,
          extracted_deadline_at: parsed.deadlineAt,
          extracted_action_required: parsed.actionRequired,
          suggested_status: parsed.suggestedStatus,
          summary: parsed.summary,
          confidence: parsed.confidence,
          parsed_json: parsed as unknown as Record<string, unknown>,
        });

        if (!error) createdInboxCount += 1;
      }
    }

    await supabase
      .from("email_accounts")
      .update({
        last_synced_at: syncStartedAt,
      })
      .eq("id", account.id)
      .eq("user_id", account.user_id);

    if (logId) {
      await supabase
        .from("email_sync_logs")
        .update({
          status: "success",
          finished_at: new Date().toISOString(),
          fetched_count: fetchedCount,
          created_inbox_count: createdInboxCount,
        })
        .eq("id", logId);
    }

    return { fetchedCount, createdInboxCount };
  } catch (error) {
    if (logId) {
      await supabase
        .from("email_sync_logs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          fetched_count: fetchedCount,
          created_inbox_count: createdInboxCount,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", logId);
    }

    throw error;
  }
}

export async function syncGmailAccountsForCron(
  accounts: EmailAccount[],
  syncAccount: (account: EmailAccount) => Promise<GmailSyncResult> = syncGmailAccount,
): Promise<CronGmailSyncSummary> {
  const results: CronAccountSyncResult[] = [];

  for (const account of accounts) {
    try {
      const result = await syncAccount(account);
      results.push({
        accountId: account.id,
        userId: account.user_id,
        status: "success",
        fetchedCount: result.fetchedCount,
        createdInboxCount: result.createdInboxCount,
      });
    } catch (error) {
      results.push({
        accountId: account.id,
        userId: account.user_id,
        status: "failed",
        fetchedCount: 0,
        createdInboxCount: 0,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const successCount = results.filter((result) => result.status === "success").length;
  const failureCount = results.length - successCount;

  return {
    accountCount: accounts.length,
    successCount,
    failureCount,
    fetchedCount: results.reduce((total, result) => total + result.fetchedCount, 0),
    createdInboxCount: results.reduce(
      (total, result) => total + result.createdInboxCount,
      0,
    ),
    results,
  };
}

export async function syncEnabledGmailAccountsForCron() {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("email_accounts")
    .select(
      "id,user_id,access_token_encrypted,refresh_token_encrypted,token_expires_at,last_synced_at,created_at",
    )
    .eq("provider", "gmail")
    .eq("sync_enabled", true)
    .order("updated_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return syncGmailAccountsForCron((data ?? []) as EmailAccount[]);
}
