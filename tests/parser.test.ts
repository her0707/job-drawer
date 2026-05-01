import { describe, expect, it } from "vitest";
import { parseInboxText } from "@/lib/parser";

describe("parseInboxText", () => {
  it("parses screening pass and interview selection", () => {
    const result = parseInboxText({
      source: "kakao_paste",
      receivedAt: "2026-04-28T12:00:00+09:00",
      rawText: `안녕하세요. A회사 채용담당자입니다.
지원하신 Product Manager 포지션 서류 전형에 합격하셨습니다.
1차 인터뷰 일정을 아래 링크에서 선택 부탁드립니다.
감사합니다.`
    });

    expect(result.extractedCompany).toBe("A회사");
    expect(result.extractedRole).toBe("Product Manager");
    expect(result.eventType).toBe("screening_passed");
    expect(result.suggestedStatus).toBe("interview_scheduling");
    expect(result.actionRequired).toContain("일정");
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("parses confirmed interview without guessing company", () => {
    const result = parseInboxText({
      source: "kakao_paste",
      receivedAt: "2026-04-28T12:00:00+09:00",
      rawText: "1차 인터뷰는 4월 30일 오후 3시 Google Meet으로 진행됩니다. 참석 가능 여부 회신 부탁드립니다."
    });

    expect(result.extractedCompany).toBeNull();
    expect(result.eventType).toBe("interview_scheduled");
    expect(result.suggestedStatus).toBe("first_interview");
    expect(result.eventAt).toBe("2026-04-30T15:00:00+09:00");
  });

  it("parses rejection", () => {
    const result = parseInboxText({
      source: "email_manual",
      rawText: `안녕하세요. B회사 채용팀입니다.
귀한 시간을 내어 지원해주셔서 감사합니다.
안타깝게도 이번 전형에서는 함께하기 어렵게 되었습니다.`
    });

    expect(result.extractedCompany).toBe("B회사");
    expect(result.eventType).toBe("rejected");
    expect(result.suggestedStatus).toBe("rejected");
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("parses assignment deadline", () => {
    const result = parseInboxText({
      source: "email_manual",
      rawText: "C회사 과제 전형 안내드립니다. 과제 제출 마감은 2026년 5월 7일 23:59입니다."
    });

    expect(result.extractedCompany).toBe("C회사");
    expect(result.eventType).toBe("assignment_sent");
    expect(result.deadlineAt).toBe("2026-05-07T23:59:00+09:00");
  });

  it("keeps newsletter confidence low", () => {
    const result = parseInboxText({
      source: "email_manual",
      rawText: "이번 주 인기 채용 공고를 확인해보세요. 다양한 기업에서 새로운 포지션을 오픈했습니다."
    });

    expect(result.eventType).toBe("other");
    expect(result.suggestedStatus).toBeNull();
    expect(result.confidence).toBeLessThan(0.4);
  });
});
