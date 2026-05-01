import { DateTimeText } from "@/components/common/DateTimeText";
import type { InboxItem } from "@/types/domain";
import { eventLabels, inboxStatusLabels, statusLabels } from "@/lib/applications/status";
import { InboxMailContent } from "./InboxMailContent";
import { SourceBadge } from "./SourceBadge";

export function InboxItemCard({ item }: { item: InboxItem }) {
  return (
    <article className="surface rounded-[var(--radius-md)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SourceBadge source={item.source} />
        <span className="rounded-[999px] bg-panel2 px-2.5 py-1 text-xs font-extrabold text-muted">
          {inboxStatusLabels[item.status]}
        </span>
        <span className="text-xs font-semibold text-muted">
          <DateTimeText value={item.received_at} />
        </span>
      </div>
      <h2 className="type-display mt-3 text-lg font-extrabold text-ink">{item.title ?? item.summary ?? "제목 없음"}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-extrabold text-muted">회사/포지션</dt>
          <dd className="mt-1 text-ink">
            {item.extracted_company ?? "-"} / {item.extracted_role ?? "-"}
          </dd>
        </div>
        <div>
          <dt className="font-extrabold text-muted">이벤트</dt>
          <dd className="mt-1 text-ink">{item.extracted_event_type ? eventLabels[item.extracted_event_type] : "-"}</dd>
        </div>
        <div>
          <dt className="font-extrabold text-muted">추천 상태</dt>
          <dd className="mt-1 text-ink">{item.suggested_status ? statusLabels[item.suggested_status] : "-"}</dd>
        </div>
      </dl>
      <InboxMailContent item={item} />
    </article>
  );
}
