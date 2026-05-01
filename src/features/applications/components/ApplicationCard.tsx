import Link from "next/link";
import { DateTimeText } from "@/components/common/DateTimeText";
import type { Application } from "@/types/domain";
import { StatusBadge } from "./StatusBadge";

export function ApplicationCard({ application }: { application: Application }) {
  return (
    <Link
      className="focus-ring surface block rounded-[var(--radius-md)] p-4 transition hover:-translate-y-0.5 hover:shadow-lift"
      href={`/applications/${application.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="type-display text-lg font-extrabold text-ink">{application.company}</h2>
          <p className="mt-1 text-sm text-muted">{application.role}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="font-bold text-muted">지원일</dt>
          <dd className="mt-1 text-ink">
            <DateTimeText value={application.applied_at} />
          </dd>
        </div>
        <div>
          <dt className="font-bold text-muted">최근 연락</dt>
          <dd className="mt-1 text-ink">
            <DateTimeText value={application.last_contact_at} />
          </dd>
        </div>
      </dl>
      {application.next_action ? (
        <p className="inset-panel mt-4 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold text-ink">
          {application.next_action}
        </p>
      ) : null}
    </Link>
  );
}
