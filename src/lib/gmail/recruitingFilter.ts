import type { ParsedInboxItem } from "@/lib/parser";

type FilterableMail = {
  title: string | null;
  sender: string | null;
  rawText: string;
};

const positiveSignals = [
  "지원하신",
  "지원해주셔서",
  "입사지원",
  "입사 지원",
  "접수 완료",
  "정상 접수",
  "채용팀",
  "채용 담당",
  "채용담당",
  "서류 전형",
  "서류전형",
  "전형 결과",
  "결과 안내",
  "면접 안내",
  "면접 일정",
  "인터뷰 안내",
  "인터뷰 일정",
  "코딩테스트",
  "코딩 테스트",
  "과제 전형",
  "사전과제",
  "처우",
  "오퍼",
  "입사 제안",
  "합격",
  "불합격"
];

const promotionalSignals = [
  "(광고)",
  "[광고]",
  "광고)",
  "뉴스레터",
  "newsletter",
  "구독",
  "수신거부",
  "unsubscribe",
  "프로모션",
  "이벤트",
  "웨비나",
  "세미나",
  "강의",
  "클래스",
  "부트캠프",
  "커리어 레터",
  "커리어레터",
  "아티클",
  "매거진",
  "콘텐츠",
  "공부하는",
  "공부하는 당신",
  "서류조차 못 넘는 이유",
  "잘림 없이 보기"
];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function countMatches(text: string, signals: string[]) {
  return signals.reduce((count, signal) => (text.includes(signal.toLowerCase()) ? count + 1 : count), 0);
}

export function shouldStoreRecruitingMail(mail: FilterableMail, parsed: ParsedInboxItem) {
  const title = normalize(mail.title ?? "");
  const body = normalize([mail.sender, mail.title, mail.rawText].filter(Boolean).join("\n"));
  const positiveScore = countMatches(body, positiveSignals);
  const promotionalScore = countMatches(body, promotionalSignals);
  const startsAsAd = /^\s*(\(|\[)?광고(\)|\])?/.test(title);

  if (startsAsAd && positiveScore === 0) return false;
  if (promotionalScore >= 2 && positiveScore === 0) return false;
  if (promotionalScore >= 3 && positiveScore < 2) return false;
  if (parsed.confidence < 0.55 && promotionalScore > 0 && positiveScore === 0) return false;

  return true;
}
