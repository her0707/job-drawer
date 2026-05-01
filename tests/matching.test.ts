import { describe, expect, it } from "vitest";
import { scoreApplicationMatch } from "@/lib/applications/matching";
import type { Application } from "@/types/domain";

const application: Application = {
  id: "app-1",
  user_id: "user-1",
  company: "A회사",
  role: "Product Manager",
  channel: "wanted",
  status: "screening",
  applied_at: new Date().toISOString(),
  deadline_at: null,
  last_contact_at: null,
  job_post_url: null,
  job_post_snapshot: null,
  resume_version: null,
  portfolio_version: null,
  priority: 3,
  next_action: null,
  next_action_due_at: null,
  memo: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

describe("scoreApplicationMatch", () => {
  it("scores exact company and role as a strong match", () => {
    const score = scoreApplicationMatch(
      {
        extracted_company: "A회사",
        extracted_role: "Product Manager",
        sender: "A회사 채용팀"
      },
      application
    );

    expect(score).toBeGreaterThanOrEqual(70);
  });
});
