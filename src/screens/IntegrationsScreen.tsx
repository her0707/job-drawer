import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { GmailIntegrationPanel } from "@/features/gmail/components/GmailIntegrationPanel";
import { DateTimeText } from "@/components/common/DateTimeText";
import { syncLogStatusLabels } from "@/lib/applications/status";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export async function IntegrationsScreen() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const [accounts, logs] = await Promise.all([
    supabase.from("email_accounts").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("email_sync_logs").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(8)
  ]);
  const account = accounts.data?.[0];

  return (
    <AppShell>
      <PageHeader description="외부 계정은 후보 생성까지만 자동화합니다." title="연동 관리" />
      <div className="grid gap-6">
        <GmailIntegrationPanel
          email={account?.email ?? null}
          hasAccount={Boolean(account)}
          hasRefreshToken={Boolean(account?.refresh_token_encrypted)}
        />
        <section className="surface rounded-[var(--radius-md)] p-5">
          <h2 className="type-display text-lg font-extrabold">동기화 기록</h2>
          <div className="mt-4 grid gap-3">
            {(logs.data ?? []).map((log) => (
              <article className="inset-panel rounded-[var(--radius-sm)] p-3" key={log.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-extrabold">{syncLogStatusLabels[log.status] ?? log.status}</p>
                  <p className="text-sm text-muted">
                    <DateTimeText value={log.started_at} />
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  fetched {log.fetched_count}, created {log.created_inbox_count}
                </p>
                {log.error_message ? <p className="mt-1 text-sm text-danger">{log.error_message}</p> : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
