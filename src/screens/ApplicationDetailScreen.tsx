import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LinkButton } from "@/components/common/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { DateTimeText } from "@/components/common/DateTimeText";
import { ApplicationQuickFacts } from "@/features/applications/components/ApplicationQuickFacts";
import { ApplicationTimeline } from "@/features/applications/components/ApplicationTimeline";
import { EventCreateForm, QACreateForm, TodoCreateForm } from "@/features/applications/components/InlineCreateForms";
import { TodoList } from "@/features/todos/components/TodoList";
import { QAList } from "@/features/qa/components/QAList";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export async function ApplicationDetailScreen({ id }: { id: string }) {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const [application, events, todos, qaEntries] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("application_events")
      .select("*")
      .eq("application_id", id)
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false }),
    supabase.from("todos").select("*").eq("application_id", id).eq("user_id", user.id).order("due_at"),
    supabase.from("qa_entries").select("*").eq("application_id", id).eq("user_id", user.id).order("created_at")
  ]);

  if (!application.data) notFound();

  return (
    <AppShell>
      <PageHeader
        action={<LinkButton href={`/applications/${id}/edit`} variant="secondary">수정</LinkButton>}
        title="지원 상세"
      />
      <div className="grid gap-6">
        <ApplicationQuickFacts application={application.data} />
        <section className="surface grid gap-4 rounded-[var(--radius-md)] p-5">
          <h2 className="type-display text-lg font-extrabold">타임라인</h2>
          <ApplicationTimeline events={events.data ?? []} />
          <EventCreateForm applicationId={id} />
        </section>
        <section className="surface grid gap-4 rounded-[var(--radius-md)] p-5">
          <h2 className="type-display text-lg font-extrabold">할 일</h2>
          <TodoList todos={todos.data ?? []} />
          <TodoCreateForm applicationId={id} />
        </section>
        <section className="surface grid gap-4 rounded-[var(--radius-md)] p-5">
          <h2 className="type-display text-lg font-extrabold">Q&A</h2>
          <QAList entries={qaEntries.data ?? []} />
          <QACreateForm applicationId={id} />
        </section>
        <section className="surface rounded-[var(--radius-md)] p-5">
          <h2 className="type-display text-lg font-extrabold">메모 / 스냅샷</h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="font-bold text-muted">공고 URL</dt>
              <dd className="mt-1">{application.data.job_post_url ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-bold text-muted">다음 액션 마감</dt>
              <dd className="mt-1">
                <DateTimeText value={application.data.next_action_due_at} />
              </dd>
            </div>
            <div>
              <dt className="font-bold text-muted">메모</dt>
              <dd className="mt-1 whitespace-pre-wrap">{application.data.memo ?? "-"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
