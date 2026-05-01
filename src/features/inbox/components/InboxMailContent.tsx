import { DateTimeText } from "@/components/common/DateTimeText";
import type { InboxItem } from "@/types/domain";

export function InboxMailContent({ item }: { item: InboxItem }) {
  return (
    <details className="mt-4 rounded-[var(--radius-sm)] border border-line bg-white open:shadow-sm">
      <summary className="focus-ring cursor-pointer list-none px-4 py-3 text-sm font-extrabold text-ink">
        메일 원문 보기
      </summary>
      <div className="border-t border-line">
        <div className="grid gap-2 bg-panel2 px-4 py-3 text-sm">
          <div className="grid gap-1 sm:grid-cols-[72px_1fr]">
            <span className="font-bold text-muted">보낸 사람</span>
            <span className="font-semibold text-ink">{item.sender ?? "-"}</span>
          </div>
          <div className="grid gap-1 sm:grid-cols-[72px_1fr]">
            <span className="font-bold text-muted">제목</span>
            <span className="font-semibold text-ink">{item.title ?? "제목 없음"}</span>
          </div>
          <div className="grid gap-1 sm:grid-cols-[72px_1fr]">
            <span className="font-bold text-muted">받은 시간</span>
            <span className="font-semibold text-ink">
              <DateTimeText value={item.received_at} />
            </span>
          </div>
        </div>
        {item.raw_text ? (
          <div className="max-h-[520px] overflow-auto px-4 py-5">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-ink">{item.raw_text}</pre>
          </div>
        ) : (
          <p className="px-4 py-5 text-sm font-semibold text-muted">저장된 원문이 없습니다.</p>
        )}
      </div>
    </details>
  );
}
