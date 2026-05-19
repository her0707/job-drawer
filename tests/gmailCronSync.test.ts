import { describe, expect, it } from "vitest";
import { syncGmailAccountsForCron, type EmailAccount } from "@/lib/gmail/sync";

const baseAccount: EmailAccount = {
  id: "account-1",
  user_id: "user-1",
  access_token_encrypted: null,
  refresh_token_encrypted: "encrypted-refresh-token",
  token_expires_at: null,
  last_synced_at: null,
  created_at: "2026-05-19T00:00:00.000Z",
};

describe("syncGmailAccountsForCron", () => {
  it("continues syncing remaining Gmail accounts when one account fails", async () => {
    const accounts: EmailAccount[] = [
      baseAccount,
      { ...baseAccount, id: "account-2", user_id: "user-2" },
    ];

    const result = await syncGmailAccountsForCron(accounts, async (account) => {
      if (account.id === "account-1") {
        throw new Error("refresh token expired");
      }

      return { fetchedCount: 3, createdInboxCount: 2 };
    });

    expect(result.accountCount).toBe(2);
    expect(result.successCount).toBe(1);
    expect(result.failureCount).toBe(1);
    expect(result.fetchedCount).toBe(3);
    expect(result.createdInboxCount).toBe(2);
    expect(result.results).toEqual([
      {
        accountId: "account-1",
        userId: "user-1",
        status: "failed",
        fetchedCount: 0,
        createdInboxCount: 0,
        errorMessage: "refresh token expired",
      },
      {
        accountId: "account-2",
        userId: "user-2",
        status: "success",
        fetchedCount: 3,
        createdInboxCount: 2,
      },
    ]);
  });
});
