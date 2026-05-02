import type { JobPostPreview, JobPostProviderAdapter } from "../types";

type WantedInitialData = {
  id?: number | string;
  company?: {
    company_name?: string;
  };
  due_time?: string | null;
  close_time?: string | null;
  intro?: string | null;
  preferred_points?: string | null;
  benefits?: string | null;
  main_tasks?: string | null;
  position?: string | null;
  requirements?: string | null;
  status?: string | null;
  hidden?: boolean | null;
  address?: {
    full_location?: string | null;
  };
};

type JsonLdJobPosting = {
  "@type"?: string;
  title?: string;
  description?: string;
  url?: string;
  validThrough?: string;
  hiringOrganization?: {
    name?: string;
  };
  jobLocation?: {
    address?: {
      streetAddress?: string;
    };
  };
};

export class JobPostPreviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JobPostPreviewError";
  }
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function extractScriptContent(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1]?.trim() ?? null;
}

function extractMetaContent(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return "";
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseNextData(html: string): WantedInitialData | null {
  const content = extractScriptContent(html, /<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    return parsed?.props?.pageProps?.initialData ?? null;
  } catch {
    return null;
  }
}

function parseJsonLdJobPosting(html: string): JsonLdJobPosting | null {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const jobPosting = candidates.find((candidate) => candidate?.["@type"] === "JobPosting");
      if (jobPosting) return jobPosting;
    } catch {
      // Try the next JSON-LD block.
    }
  }

  return null;
}

function parseWantedUrl(url: URL) {
  const match = url.pathname.match(/^\/wd\/(\d+)\/?$/);
  return match?.[1] ?? null;
}

function normalizeWantedUrl(url: URL) {
  const id = parseWantedUrl(url);
  if (!id) throw new JobPostPreviewError("원티드 공고 URL은 /wd/{id} 형식이어야 합니다.");
  return new URL(`/wd/${id}`, "https://www.wanted.co.kr");
}

function isPast(value: string | null | undefined, now = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < now.getTime();
}

function ensureOpenPost(data: WantedInitialData | null) {
  if (!data) return;
  if (data.status === "close" || data.hidden === true || isPast(data.close_time) || isPast(data.due_time)) {
    throw new JobPostPreviewError("마감되었거나 비공개인 원티드 공고는 불러올 수 없습니다.");
  }
}

function buildSnapshot(data: WantedInitialData | null, jsonLd: JsonLdJobPosting | null) {
  const sections = [
    ["포지션 상세", data?.intro],
    ["주요업무", data?.main_tasks ?? jsonLd?.description],
    ["자격요건", data?.requirements],
    ["우대사항", data?.preferred_points],
    ["혜택 및 복지", data?.benefits],
    ["근무지역", data?.address?.full_location ?? jsonLd?.jobLocation?.address?.streetAddress]
  ]
    .map(([title, body]) => [title, text(body)] as const)
    .filter(([, body]) => body.length > 0)
    .map(([title, body]) => `## ${title}\n${body}`);

  return sections.join("\n\n");
}

function buildSummary(company: string, role: string, location: string, deadlineAt: string | null) {
  const parts = [`${company} / ${role}`];
  if (location) parts.push(location);
  parts.push(deadlineAt ? `마감일 ${deadlineAt.slice(0, 10)}` : "상시채용 또는 마감일 미기재");
  return parts.join(" · ");
}

export function parseWantedJobPostHtml(html: string, url: URL): JobPostPreview {
  const providerId = parseWantedUrl(url);
  if (!providerId) throw new JobPostPreviewError("원티드 공고 URL은 /wd/{id} 형식이어야 합니다.");

  const data = parseNextData(html);
  const jsonLd = parseJsonLdJobPosting(html);
  ensureOpenPost(data);

  const title = extractMetaContent(html, "og:title");
  const titleMatch = title.match(/^\[(.+?)]\s*(.+?)\s*채용 공고/);
  const company = text(data?.company?.company_name) || text(jsonLd?.hiringOrganization?.name) || text(titleMatch?.[1]);
  const role = text(data?.position) || text(jsonLd?.title) || text(titleMatch?.[2]);
  const deadlineAt = text(data?.due_time) || text(jsonLd?.validThrough) || null;
  const snapshot = buildSnapshot(data, jsonLd);
  const location = text(data?.address?.full_location) || text(jsonLd?.jobLocation?.address?.streetAddress);

  if (!company || !role) {
    throw new JobPostPreviewError("원티드 공고에서 회사명과 포지션을 찾지 못했습니다.");
  }

  if (!snapshot) {
    throw new JobPostPreviewError("원티드 공고 상세 내용을 찾지 못했습니다.");
  }

  return {
    provider: "wanted",
    providerId,
    url: normalizeWantedUrl(url).toString(),
    company,
    role,
    channel: "wanted",
    deadlineAt,
    snapshot,
    summary: buildSummary(company, role, location, deadlineAt)
  };
}

export const wantedJobPostProvider: JobPostProviderAdapter = {
  provider: "wanted",
  supports(url) {
    return (url.hostname === "www.wanted.co.kr" || url.hostname === "wanted.co.kr") && Boolean(parseWantedUrl(url));
  },
  async preview(url) {
    const normalizedUrl = normalizeWantedUrl(url);
    const response = await fetch(normalizedUrl, {
      headers: {
        accept: "text/html",
        "user-agent": "JobDrawer/0.1 (+https://www.wanted.co.kr)"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new JobPostPreviewError("원티드 공고 페이지를 불러오지 못했습니다.");
    }

    const html = await response.text();
    return parseWantedJobPostHtml(html, normalizedUrl);
  }
};
