import { inboxSourceLabels } from "@/lib/applications/status";
import type { InboxSource } from "@/types/domain";

export function SourceBadge({ source }: { source: InboxSource }) {
  return (
    <span className="inline-flex rounded-[999px] border border-line bg-panel2 px-2.5 py-1 text-xs font-extrabold text-muted">
      {inboxSourceLabels[source]}
    </span>
  );
}
