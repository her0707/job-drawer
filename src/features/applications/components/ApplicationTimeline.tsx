import { DateTimeText } from "@/components/common/DateTimeText";
import { eventLabels } from "@/lib/applications/status";
import type { ApplicationEvent } from "@/types/domain";

export function ApplicationTimeline({ events }: { events: ApplicationEvent[] }) {
  if (events.length === 0) {
    return <p className="inset-panel rounded-[var(--radius-sm)] p-4 text-sm text-muted">아직 타임라인 이벤트가 없습니다.</p>;
  }

  return (
    <ol className="grid gap-3">
      {events.map((event) => (
        <li className="paper rounded-[var(--radius-sm)] p-4" key={event.id}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">{eventLabels[event.event_type]}</p>
              <h3 className="mt-1 font-extrabold text-ink">{event.title}</h3>
            </div>
            <p className="text-xs font-semibold text-muted">
              <DateTimeText value={event.occurred_at} />
            </p>
          </div>
          {event.body ? <p className="mt-3 text-sm leading-6 text-muted">{event.body}</p> : null}
        </li>
      ))}
    </ol>
  );
}
