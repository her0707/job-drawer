import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/api/http";
import { getJobPostProvider, JobPostPreviewError, parseJobPostUrl, type JobPostProvider } from "@/lib/job-posts";
import { createRouteSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await readJson<{ provider?: JobPostProvider; url?: string }>(request);
  if (!body.provider) return jsonError("채용사이트를 선택해주세요.");
  if (!body.url?.trim()) return jsonError("공고 URL을 입력해주세요.");

  const adapter = getJobPostProvider(body.provider);
  if (!adapter) return jsonError("지원하지 않는 채용사이트입니다.");

  const url = parseJobPostUrl(body.url.trim());
  if (!url) return jsonError("올바른 URL을 입력해주세요.");
  if (!adapter.supports(url)) return jsonError("선택한 채용사이트와 URL이 일치하지 않습니다.");

  try {
    const jobPost = await adapter.preview(url);
    return NextResponse.json({ jobPost });
  } catch (error) {
    if (error instanceof JobPostPreviewError) return jsonError(error.message);
    return jsonError("공고 정보를 불러오지 못했습니다.", 500);
  }
}
