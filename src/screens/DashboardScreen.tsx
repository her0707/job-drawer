import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DateTimeText } from "@/components/common/DateTimeText";
import { LinkButton } from "@/components/common/Button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { statusLabels } from "@/lib/applications/status";
import type { ApplicationStatus } from "@/types/domain";

export async function DashboardScreen() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const [applications, todos, inboxItems] = await Promise.all([
    supabase.from("applications").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "open")
      .order("due_at", { ascending: true })
      .limit(6),
    supabase
      .from("inbox_items")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "needs_review"])
      .order("received_at", { ascending: false })
      .limit(5)
  ]);
  const appRows = applications.data ?? [];
  const openTodos = todos.data ?? [];
  const recentInbox = inboxItems.data ?? [];
  const activeCount = appRows.filter((app) => !["accepted", "rejected", "withdrawn"].includes(app.status)).length;

  return (
    <AppShell>
      <PageHeader
        action={<LinkButton href="/applications/new">새 지원 건</LinkButton>}
        description="오늘 봐야 할 지원 건, 수신함 후보, 할 일을 한눈에 확인합니다."
        title="대시보드"
      />
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="총 지원" value={appRows.length} />
        <Metric label="진행 중" value={activeCount} />
        <Metric label="열린 할 일" value={openTodos.length} />
        <Metric label="수신함 후보" value={recentInbox.length} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface rounded-[var(--radius-md)] p-5">
          <h2 className="type-display text-lg font-extrabold">최근 업데이트</h2>
          <div className="mt-4 grid gap-3">
            {appRows.slice(0, 5).map((application) => (
              <article className="inset-panel rounded-[var(--radius-sm)] p-3" key={application.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{application.company}</p>
                    <p className="text-sm text-muted">{application.role}</p>
                  </div>
                  <p className="text-xs font-bold text-muted">{statusLabels[application.status as ApplicationStatus]}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="surface rounded-[var(--radius-md)] p-5">
          <h2 className="type-display text-lg font-extrabold">이번 주 할 일</h2>
          <div className="mt-4 grid gap-3">
            {openTodos.map((todo) => (
              <article className="inset-panel rounded-[var(--radius-sm)] p-3" key={todo.id}>
                <p className="font-extrabold">{todo.title}</p>
                <p className="mt-1 text-sm text-muted">
                  <DateTimeText value={todo.due_at} fallback="마감일 없음" />
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <section className="paper rounded-[var(--radius-md)] p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="numeric mt-2 text-4xl font-black leading-none text-ink">{value}</p>
    </section>
  );
}
