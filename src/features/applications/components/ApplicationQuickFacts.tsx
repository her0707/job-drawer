import { DateTimeText } from "@/components/common/DateTimeText";
import type { Application } from "@/types/domain";
import { StatusBadge } from "./StatusBadge";

export function ApplicationQuickFacts({ application }: { application: Application }) {
  return (
    <section className="surface rounded-[var(--radius-md)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="type-display text-3xl font-extrabold leading-tight text-ink">{application.company}</h1>
          <p className="mt-1 text-lg font-semibold text-muted">{application.role}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="inset-panel rounded-[var(--radius-sm)] p-3">
          <dt className="text-xs font-bold text-muted">지원일</dt>
          <dd className="mt-1 text-sm font-semibold">
            <DateTimeText value={application.applied_at} />
          </dd>
        </div>
        <div className="inset-panel rounded-[var(--radius-sm)] p-3">
          <dt className="text-xs font-bold text-muted">최근 연락</dt>
          <dd className="mt-1 text-sm font-semibold">
            <DateTimeText value={application.last_contact_at} />
          </dd>
        </div>
        <div className="inset-panel rounded-[var(--radius-sm)] p-3">
          <dt className="text-xs font-bold text-muted">이력서</dt>
          <dd className="mt-1 text-sm font-semibold">{application.resume_version ?? "-"}</dd>
        </div>
        <div className="inset-panel rounded-[var(--radius-sm)] p-3">
          <dt className="text-xs font-bold text-muted">다음 액션</dt>
          <dd className="mt-1 text-sm font-semibold">{application.next_action ?? "-"}</dd>
        </div>
      </dl>
    </section>
  );
}
