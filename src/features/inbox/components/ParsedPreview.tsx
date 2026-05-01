import { eventLabels, statusLabels } from "@/lib/applications/status";
import type { ParsedInboxItem } from "@/lib/parser";

export function ParsedPreview({ parsed }: { parsed: ParsedInboxItem }) {
  return (
    <section className="paper rounded-[var(--radius-md)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-[999px] bg-accent/10 px-2.5 py-1 text-xs font-extrabold text-accent">
          {eventLabels[parsed.eventType]}
        </span>
        {parsed.suggestedStatus ? (
          <span className="rounded-[999px] bg-panel px-2.5 py-1 text-xs font-extrabold text-muted">
            추천 상태: {statusLabels[parsed.suggestedStatus]}
          </span>
        ) : null}
        <span className="rounded-[999px] bg-panel px-2.5 py-1 text-xs font-extrabold text-muted">
          confidence {parsed.confidence.toFixed(2)}
        </span>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-extrabold text-muted">회사</dt>
          <dd className="mt-1 text-ink">{parsed.extractedCompany ?? "-"}</dd>
        </div>
        <div>
          <dt className="font-extrabold text-muted">포지션</dt>
          <dd className="mt-1 text-ink">{parsed.extractedRole ?? "-"}</dd>
        </div>
        <div>
          <dt className="font-extrabold text-muted">일정</dt>
          <dd className="mt-1 text-ink">{parsed.eventAt ?? "-"}</dd>
        </div>
        <div>
          <dt className="font-extrabold text-muted">마감</dt>
          <dd className="mt-1 text-ink">{parsed.deadlineAt ?? "-"}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-muted">{parsed.summary}</p>
    </section>
  );
}
