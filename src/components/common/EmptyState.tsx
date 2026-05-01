import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="paper rounded-[var(--radius-md)] px-6 py-10 text-center">
      <h2 className="type-display text-xl font-extrabold text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-prose text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
