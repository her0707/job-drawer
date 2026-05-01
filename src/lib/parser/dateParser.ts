const SEOUL_OFFSET = "+09:00";

type ParsedDateResult = {
  iso: string | null;
  phrase: string | null;
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function makeIso(year: number, month: number, day: number, hour = 9, minute = 0) {
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${SEOUL_OFFSET}`;
}

function getReferenceDate(receivedAt?: string) {
  const date = receivedAt ? new Date(receivedAt) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function extractTime(text: string) {
  const meridiemMatch = text.match(/(오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);

  if (meridiemMatch) {
    const [, meridiem, hourText, minuteText] = meridiemMatch;
    let hour = Number(hourText);
    if (meridiem === "오후" && hour < 12) hour += 12;
    if (meridiem === "오전" && hour === 12) hour = 0;
    return { hour, minute: minuteText ? Number(minuteText) : 0 };
  }

  const clockMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (clockMatch) {
    return { hour: Number(clockMatch[1]), minute: Number(clockMatch[2]) };
  }

  return { hour: 9, minute: 0 };
}

export function parseKoreanDate(text: string, receivedAt?: string): ParsedDateResult {
  const reference = getReferenceDate(receivedAt);
  const referenceYear = reference.getFullYear();
  const time = extractTime(text);

  const isoMatch = text.match(/(20\d{2})[-.](\d{1,2})[-.](\d{1,2})/);
  if (isoMatch) {
    return {
      iso: makeIso(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]), time.hour, time.minute),
      phrase: isoMatch[0]
    };
  }

  const koreanFullMatch = text.match(/(20\d{2})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (koreanFullMatch) {
    return {
      iso: makeIso(
        Number(koreanFullMatch[1]),
        Number(koreanFullMatch[2]),
        Number(koreanFullMatch[3]),
        time.hour,
        time.minute
      ),
      phrase: koreanFullMatch[0]
    };
  }

  const monthDayMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (monthDayMatch) {
    return {
      iso: makeIso(referenceYear, Number(monthDayMatch[1]), Number(monthDayMatch[2]), time.hour, time.minute),
      phrase: monthDayMatch[0]
    };
  }

  if (/내일/.test(text)) {
    const date = new Date(reference);
    date.setDate(reference.getDate() + 1);
    return {
      iso: makeIso(date.getFullYear(), date.getMonth() + 1, date.getDate(), time.hour, time.minute),
      phrase: "내일"
    };
  }

  if (/오늘/.test(text)) {
    return {
      iso: makeIso(reference.getFullYear(), reference.getMonth() + 1, reference.getDate(), time.hour, time.minute),
      phrase: "오늘"
    };
  }

  return { iso: null, phrase: null };
}

export function parseDeadline(text: string, receivedAt?: string) {
  const deadlineSentence = text
    .split(/\n|\.|。/)
    .find((sentence) => /마감|기한|제출/.test(sentence) && /일|[-.]|오늘|내일/.test(sentence));

  return parseKoreanDate(deadlineSentence ?? text, receivedAt);
}
