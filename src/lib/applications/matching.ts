import type { Application, InboxItem } from "@/types/domain";

export type ApplicationMatch = {
  application: Application;
  score: number;
  strength: "strong" | "possible";
};

function textIncludes(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  return left.toLocaleLowerCase("ko-KR").includes(right.toLocaleLowerCase("ko-KR"));
}

function exact(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  return left.trim().toLocaleLowerCase("ko-KR") === right.trim().toLocaleLowerCase("ko-KR");
}

function isRecent(dateText: string | null) {
  if (!dateText) return false;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return false;
  const age = Date.now() - date.getTime();
  return age >= 0 && age <= 90 * 24 * 60 * 60 * 1000;
}

export function scoreApplicationMatch(inboxItem: Pick<InboxItem, "extracted_company" | "extracted_role" | "sender">, application: Application) {
  let score = 0;

  if (exact(application.company, inboxItem.extracted_company)) score += 60;
  else if (
    textIncludes(application.company, inboxItem.extracted_company) ||
    textIncludes(inboxItem.extracted_company, application.company)
  ) {
    score += 40;
  }

  if (exact(application.role, inboxItem.extracted_role)) score += 30;
  else if (
    textIncludes(application.role, inboxItem.extracted_role) ||
    textIncludes(inboxItem.extracted_role, application.role)
  ) {
    score += 15;
  }

  if (isRecent(application.applied_at)) score += 10;
  if (application.status !== "rejected" && application.status !== "accepted") score += 10;
  if (inboxItem.sender && textIncludes(inboxItem.sender, application.company)) score += 5;

  return score;
}

export function getApplicationMatches(inboxItem: InboxItem, applications: Application[]): ApplicationMatch[] {
  return applications
    .map((application) => ({
      application,
      score: scoreApplicationMatch(inboxItem, application)
    }))
    .filter(({ score }) => score >= 40)
    .sort((a, b) => b.score - a.score)
    .map(({ application, score }) => ({
      application,
      score,
      strength: score >= 70 ? "strong" : "possible"
    }));
}
