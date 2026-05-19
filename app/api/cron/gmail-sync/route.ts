import { NextResponse } from "next/server";
import { isCronRequestAuthorized } from "@/lib/cron/auth";
import { syncEnabledGmailAccountsForCron } from "@/lib/gmail/sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncEnabledGmailAccountsForCron();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Gmail cron sync failed.",
      },
      { status: 500 },
    );
  }
}
