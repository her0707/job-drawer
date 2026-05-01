import type { QAEntry } from "@/types/domain";

export function QAList({ entries }: { entries: QAEntry[] }) {
  if (entries.length === 0) {
    return <p className="inset-panel rounded-[var(--radius-sm)] p-4 text-sm text-muted">저장된 지원서 질문과 답변이 없습니다.</p>;
  }

  return (
    <div className="grid gap-3">
      {entries.map((entry) => (
        <article className="paper rounded-[var(--radius-sm)] p-4" key={entry.id}>
          <h3 className="font-extrabold text-ink">{entry.question}</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{entry.answer}</p>
          {entry.memo ? <p className="mt-3 text-xs font-semibold text-muted">{entry.memo}</p> : null}
        </article>
      ))}
    </div>
  );
}
