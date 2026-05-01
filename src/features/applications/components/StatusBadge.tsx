import type { ApplicationStatus } from "@/types/domain";
import { statusLabels } from "@/lib/applications/status";

const tone: Record<ApplicationStatus, string> = {
  interested: "bg-panel2 text-muted border-line",
  planned: "bg-panel2 text-muted border-line",
  applied: "bg-accent/10 text-accent border-accent/20",
  screening: "bg-accent/10 text-accent border-accent/20",
  assignment_or_test: "bg-warn/15 text-ink border-warn/30",
  interview_scheduling: "bg-accent2/15 text-ink border-accent2/30",
  first_interview: "bg-accent2/15 text-ink border-accent2/30",
  second_interview: "bg-accent2/15 text-ink border-accent2/30",
  final_interview: "bg-accent2/15 text-ink border-accent2/30",
  offer_negotiation: "bg-good/15 text-ink border-good/30",
  accepted: "bg-good/15 text-ink border-good/30",
  rejected: "bg-danger/10 text-danger border-danger/20",
  on_hold: "bg-panel2 text-muted border-line",
  withdrawn: "bg-panel2 text-muted border-line"
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex rounded-[999px] border px-2.5 py-1 text-xs font-extrabold ${tone[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
