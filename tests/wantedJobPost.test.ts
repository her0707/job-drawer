import { describe, expect, it } from "vitest";
import { JobPostPreviewError } from "@/lib/job-posts";
import { parseWantedJobPostHtml, wantedJobPostProvider } from "@/lib/job-posts/providers/wanted";

const url = new URL("https://www.wanted.co.kr/wd/12345");

function htmlWithInitialData(initialData: Record<string, unknown>, metaTitle = "[테스트회사] Product Manager 채용 공고 | 원티드") {
  const titleMeta = metaTitle ? `<meta property="og:title" content="${metaTitle}" />` : "";

  return `<!doctype html>
<html>
  <head>
    ${titleMeta}
    <script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
      props: { pageProps: { initialData } }
    })}</script>
  </head>
  <body></body>
</html>`;
}

describe("parseWantedJobPostHtml", () => {
  it("matches only wanted /wd urls", () => {
    expect(wantedJobPostProvider.supports(new URL("https://www.wanted.co.kr/wd/12345"))).toBe(true);
    expect(wantedJobPostProvider.supports(new URL("https://www.saramin.co.kr/zf_user/jobs/view?rec_idx=1"))).toBe(false);
    expect(wantedJobPostProvider.supports(new URL("https://www.wanted.co.kr/company/79"))).toBe(false);
  });

  it("extracts a wanted job post preview", () => {
    const result = parseWantedJobPostHtml(
      htmlWithInitialData({
        id: 12345,
        company: { company_name: "테스트회사" },
        due_time: "2099-06-30T14:59:59Z",
        intro: "성장하는 팀입니다.",
        main_tasks: "제품 전략 수립",
        requirements: "PM 경험 3년 이상",
        preferred_points: "B2B 경험",
        benefits: "유연근무",
        position: "Product Manager",
        status: "active",
        hidden: false,
        address: { full_location: "서울 강남구" }
      }),
      url
    );

    expect(result.company).toBe("테스트회사");
    expect(result.role).toBe("Product Manager");
    expect(result.channel).toBe("wanted");
    expect(result.deadlineAt).toBe("2099-06-30T14:59:59Z");
    expect(result.snapshot).toContain("## 주요업무");
    expect(result.snapshot).toContain("제품 전략 수립");
  });

  it("blocks closed or hidden wanted posts", () => {
    expect(() =>
      parseWantedJobPostHtml(
        htmlWithInitialData({
          company: { company_name: "테스트회사" },
          intro: "상세",
          position: "Product Manager",
          status: "close",
          hidden: false
        }),
        url
      )
    ).toThrow(JobPostPreviewError);
  });

  it("fails when required fields are missing", () => {
    expect(() =>
      parseWantedJobPostHtml(
        htmlWithInitialData({
          company: { company_name: "테스트회사" },
          intro: "상세",
          status: "active",
          hidden: false
        }, ""),
        url
      )
    ).toThrow(JobPostPreviewError);
  });
});
