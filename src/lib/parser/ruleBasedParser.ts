import type { ApplicationStatus, EventType } from "@/types/domain";
import { parseDeadline, parseKoreanDate } from "./dateParser";
import type { ParsedInboxItem, ParseInput } from "./types";

const keywordMap: Array<{
  eventType: EventType;
  suggestedStatus: ApplicationStatus | null;
  keywords: string[];
  baseConfidence: number;
}> = [
  {
    eventType: "final_accepted",
    suggestedStatus: "accepted",
    keywords: ["최종 합격", "합격을 축하", "입사 제안", "오퍼 드립니다"],
    baseConfidence: 0.82
  },
  {
    eventType: "rejected",
    suggestedStatus: "rejected",
    keywords: ["불합격", "안타깝게도", "함께하기 어렵", "좋은 인연으로", "아쉽게도"],
    baseConfidence: 0.8
  },
  {
    eventType: "screening_passed",
    suggestedStatus: "interview_scheduling",
    keywords: ["서류 합격", "서류 전형에 합격", "서류전형 합격", "다음 전형"],
    baseConfidence: 0.72
  },
  {
    eventType: "interview_scheduled",
    suggestedStatus: "first_interview",
    keywords: ["면접 확정", "인터뷰 확정", "일정이 확정", "Google Meet", "Zoom", "진행됩니다"],
    baseConfidence: 0.65
  },
  {
    eventType: "interview_invited",
    suggestedStatus: "interview_scheduling",
    keywords: ["면접 안내", "인터뷰 안내", "일정 선택", "면접 가능 일정"],
    baseConfidence: 0.68
  },
  {
    eventType: "assignment_sent",
    suggestedStatus: "assignment_or_test",
    keywords: ["과제", "사전과제", "과제 전형", "과제 제출"],
    baseConfidence: 0.76
  },
  {
    eventType: "coding_test_sent",
    suggestedStatus: "assignment_or_test",
    keywords: ["코딩테스트", "코딩 테스트", "알고리즘 테스트", "온라인 테스트"],
    baseConfidence: 0.76
  },
  {
    eventType: "offer_negotiation",
    suggestedStatus: "offer_negotiation",
    keywords: ["처우", "연봉", "오퍼", "입사 가능일", "보상 협의"],
    baseConfidence: 0.74
  },
  {
    eventType: "application_submitted",
    suggestedStatus: "applied",
    keywords: ["지원 완료", "접수 완료", "정상 접수", "입사지원이 완료"],
    baseConfidence: 0.7
  },
  {
    eventType: "screening_started",
    suggestedStatus: "screening",
    keywords: ["서류 검토", "검토 중", "검토가 시작"],
    baseConfidence: 0.6
  },
  {
    eventType: "follow_up",
    suggestedStatus: null,
    keywords: ["회신 부탁", "추가 자료", "확인 부탁", "리마인드", "참석 가능 여부"],
    baseConfidence: 0.55
  }
];

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function extractCompany(text: string) {
  const patterns = [
    /안녕하세요[.,\s]*(.+?)\s*채용(?:팀|담당자)?입니다/,
    /(.+?)\s*채용(?:팀|담당자)?입니다/,
    /(.+?)\s+(?:과제|면접|인터뷰|서류)(?:\s*전형)?\s*(?:안내|결과)/,
    /(.+?)\s*지원(?:이|해주셔서|하신)/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const company = match?.[1]?.trim().replace(/^안녕하세요[.,\s]*/, "");
    if (company && company.length <= 30) return company;
  }

  return null;
}

function extractRole(text: string) {
  const patterns = [
    /지원하신\s+(.+?)\s+포지션/,
    /(.+?)\s+포지션\s+(?:서류|면접|인터뷰|전형)/,
    /채용\s+(.+?)\s+(?:서류|면접|인터뷰|과제)/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const role = match?.[1]?.trim();
    if (role && role.length <= 50) return role;
  }

  return null;
}

function classify(text: string) {
  const normalized = normalize(text);
  let best = {
    eventType: "other" as EventType,
    suggestedStatus: null as ApplicationStatus | null,
    confidence: 0.2,
    phrases: [] as string[]
  };

  for (const candidate of keywordMap) {
    const phrases = candidate.keywords.filter((keyword) => normalized.includes(keyword));
    if (phrases.length === 0) continue;

    const confidence = Math.min(candidate.baseConfidence + (phrases.length - 1) * 0.06, 0.92);
    if (confidence > best.confidence) {
      best = {
        eventType: candidate.eventType,
        suggestedStatus: candidate.suggestedStatus,
        confidence,
        phrases
      };
    }
  }

  return best;
}

function extractAction(text: string, eventType: EventType) {
  if (/일정.*선택/.test(text)) return "면접 가능 일정 선택";
  if (/참석 가능 여부.*회신/.test(text)) return "참석 가능 여부 회신";
  if (/과제.*제출|제출.*부탁/.test(text)) return "과제 제출";
  if (/회신 부탁|확인 부탁/.test(text)) return "요청사항 회신";

  const defaults: Partial<Record<EventType, string>> = {
    interview_invited: "면접 가능 일정 회신하기",
    interview_scheduled: "면접 준비하기",
    assignment_sent: "과제 제출하기",
    coding_test_sent: "코딩테스트 응시하기",
    offer_negotiation: "처우 정보 회신하기",
    follow_up: "요청사항 회신하기"
  };

  return defaults[eventType] ?? null;
}

function summarize(text: string, eventType: EventType) {
  const firstSentence = normalize(text).split(/(?<=다\.|요\.|니다\.|\.)\s/)[0];
  const fallback = firstSentence || normalize(text).slice(0, 120);

  if (fallback.length > 120) return `${fallback.slice(0, 117)}...`;
  if (eventType === "other") return fallback || "채용 관련성이 낮은 메시지입니다.";
  return fallback;
}

export function parseInboxText(input: ParseInput): ParsedInboxItem {
  const rawText = input.rawText.trim();
  const text = [input.title, input.sender, rawText].filter(Boolean).join("\n");
  const classification = classify(text);
  const eventDate = parseKoreanDate(text, input.receivedAt);
  const deadlineDate = parseDeadline(text, input.receivedAt);
  const isDeadlineEvent = ["assignment_sent", "coding_test_sent", "follow_up"].includes(classification.eventType);

  return {
    extractedCompany: extractCompany(text),
    extractedRole: extractRole(text),
    eventType: classification.eventType,
    suggestedStatus: classification.suggestedStatus,
    eventAt: isDeadlineEvent ? null : eventDate.iso,
    deadlineAt: isDeadlineEvent ? deadlineDate.iso : null,
    actionRequired: extractAction(text, classification.eventType),
    summary: summarize(rawText, classification.eventType),
    confidence: classification.confidence,
    importantPhrases: classification.phrases
  };
}
