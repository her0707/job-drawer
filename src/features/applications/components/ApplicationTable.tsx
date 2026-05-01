import Link from "next/link";
import { DateTimeText } from "@/components/common/DateTimeText";
import type { Application } from "@/types/domain";
import { StatusBadge } from "./StatusBadge";

export function ApplicationTable({ applications }: { applications: Application[] }) {
  return (
    <div className="surface hidden overflow-hidden rounded-[var(--radius-md)] md:block">
      <table className="hairline-table w-full text-left text-sm">
        <thead className="bg-panel2">
          <tr>
            <th className="px-4 py-3">회사</th>
            <th className="px-4 py-3">포지션</th>
            <th className="px-4 py-3">상태</th>
            <th className="px-4 py-3">지원일</th>
            <th className="px-4 py-3">최근 연락</th>
            <th className="px-4 py-3">다음 액션</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {applications.map((application) => (
            <tr key={application.id} className="transition hover:bg-panel2/80">
              <td className="px-4 py-3 font-extrabold">
                <Link href={`/applications/${application.id}`}>{application.company}</Link>
              </td>
              <td className="px-4 py-3 text-muted">{application.role}</td>
              <td className="px-4 py-3">
                <StatusBadge status={application.status} />
              </td>
              <td className="px-4 py-3 text-muted">
                <DateTimeText value={application.applied_at} />
              </td>
              <td className="px-4 py-3 text-muted">
                <DateTimeText value={application.last_contact_at} />
              </td>
              <td className="px-4 py-3 text-muted">{application.next_action ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
