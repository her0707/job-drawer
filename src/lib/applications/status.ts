import type {
  ApplicationChannel,
  ApplicationStatus,
  EventType,
  InboxSource,
  InboxStatus,
  TodoStatus
} from "@/types/domain";

export const statusLabels: Record<ApplicationStatus, string> = {
  interested: "관심",
  planned: "지원 예정",
  applied: "지원 완료",
  screening: "서류 검토",
  assignment_or_test: "과제/테스트",
  interview_scheduling: "면접 조율",
  first_interview: "1차 면접",
  second_interview: "2차 면접",
  final_interview: "최종 면접",
  offer_negotiation: "처우 협의",
  accepted: "합격",
  rejected: "불합격",
  on_hold: "보류",
  withdrawn: "지원 철회"
};

export const channelLabels: Record<ApplicationChannel, string> = {
  wanted: "원티드",
  saramin: "사람인",
  jobkorea: "잡코리아",
  linkedin: "링크드인",
  company_site: "회사 채용페이지",
  headhunter: "헤드헌터",
  referral: "추천",
  remember: "리멤버",
  rocketpunch: "로켓펀치",
  other: "기타"
};

export const inboxStatusLabels: Record<InboxStatus, string> = {
  pending: "대기",
  linked: "연결됨",
  ignored: "무시됨",
  needs_review: "검토 필요"
};

export const inboxSourceLabels: Record<InboxSource, string> = {
  gmail: "Gmail",
  email_manual: "메일 수동",
  kakao_paste: "카톡",
  sms_paste: "문자",
  dm_paste: "DM",
  manual: "수동"
};

export const todoStatusLabels: Record<TodoStatus, string> = {
  open: "열림",
  done: "완료",
  dismissed: "제외"
};

export const syncLogStatusLabels: Record<string, string> = {
  running: "동기화 중",
  success: "성공",
  failed: "실패"
};

export const eventLabels: Record<EventType, string> = {
  application_submitted: "지원 완료",
  screening_started: "서류 검토 시작",
  screening_passed: "서류 합격",
  interview_invited: "면접 일정 안내",
  interview_scheduled: "면접 일정 확정",
  assignment_sent: "과제 안내",
  coding_test_sent: "코딩테스트 안내",
  offer_negotiation: "처우 협의",
  final_accepted: "최종 합격",
  rejected: "불합격",
  follow_up: "추가 회신 필요",
  note: "메모",
  other: "기타"
};

export const eventDefaultTitles = eventLabels;

export const eventSuggestedTodo: Partial<Record<EventType, string>> = {
  interview_invited: "면접 가능 일정 회신하기",
  interview_scheduled: "면접 준비하기",
  assignment_sent: "과제 제출하기",
  coding_test_sent: "코딩테스트 응시하기",
  offer_negotiation: "처우 정보 회신하기",
  follow_up: "요청사항 회신하기"
};

export function shouldPreselectStatusUpdate(status: ApplicationStatus | null, confidence: number) {
  if (!status) return false;
  return confidence >= 0.7;
}

export function requiresExplicitStatusConfirmation(status: ApplicationStatus | null) {
  return status === "accepted" || status === "rejected" || status === "withdrawn";
}
