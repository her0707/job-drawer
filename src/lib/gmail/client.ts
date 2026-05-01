import { extractGmailBody, type GmailPayloadPart } from "./body";

type GmailHeader = {
  name: string;
  value: string;
};

type GmailMessage = {
  id: string;
  threadId: string;
  internalDate?: string;
  snippet?: string;
  payload?: {
    headers?: GmailHeader[];
    mimeType?: string;
    body?: {
      data?: string;
    };
    parts?: GmailPayloadPart[];
  };
};

function header(headers: GmailHeader[] | undefined, name: string) {
  return (
    headers?.find((item) => item.name.toLowerCase() === name.toLowerCase())
      ?.value ?? null
  );
}

async function gmailFetch<T>(accessToken: string, path: string) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1${path}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Gmail API failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function listGmailMessageIds(accessToken: string, query: string) {
  const params = new URLSearchParams({
    q: query,
    maxResults: "25",
  });

  const data = await gmailFetch<{
    messages?: Array<{ id: string; threadId: string }>;
  }>(accessToken, `/users/me/messages?${params.toString()}`);

  return data.messages ?? [];
}

export async function getGmailMessage(accessToken: string, id: string) {
  const params = new URLSearchParams({
    format: "full",
  });
  const message = await gmailFetch<GmailMessage>(
    accessToken,
    `/users/me/messages/${id}?${params.toString()}`,
  );
  const rawText = extractGmailBody(message.payload) || message.snippet || "";
  const headers = message.payload?.headers;

  return {
    id: message.id,
    threadId: message.threadId,
    title: header(headers, "subject"),
    sender: header(headers, "from"),
    receivedAt:
      header(headers, "date") ??
      (message.internalDate
        ? new Date(Number(message.internalDate)).toISOString()
        : null),
    rawText,
    snippet: message.snippet ?? "",
  };
}

export async function getGmailProfile(accessToken: string) {
  return gmailFetch<{ emailAddress: string }>(accessToken, "/users/me/profile");
}

const recruitingQueryTerms = [
  "(\"지원하신\" OR \"입사지원\" OR \"접수 완료\" OR \"정상 접수\")",
  "(\"서류 전형\" OR \"서류전형\" OR \"전형 결과\" OR \"결과 안내\")",
  "(\"면접 안내\" OR \"면접 일정\" OR \"인터뷰 안내\" OR \"인터뷰 일정\")",
  "(\"과제 전형\" OR \"사전과제\" OR \"코딩테스트\" OR \"코딩 테스트\")",
  "(\"처우\" OR \"오퍼\" OR \"입사 제안\" OR \"합격\" OR \"불합격\")",
];

const recruitingQueryExclusions = [
  "-{광고 뉴스레터 newsletter 구독 수신거부 unsubscribe 프로모션 이벤트 웨비나 세미나 강의 클래스 부트캠프 아티클 매거진 콘텐츠}",
];

function gmailDate(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export function gmailRecruitingQueriesAfter(value: string) {
  const after = gmailDate(value);
  return recruitingQueryTerms.map((term) => `after:${after} ${term} ${recruitingQueryExclusions.join(" ")}`);
}
