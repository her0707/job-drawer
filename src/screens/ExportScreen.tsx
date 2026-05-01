import { AppShell } from "@/components/layout/AppShell";
import { LinkButton } from "@/components/common/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/supabase/auth";

export async function ExportScreen() {
  await requireUser();

  return (
    <AppShell>
      <PageHeader description="지원 기록과 수신함 후보를 JSON으로 내려받습니다." title="데이터 내보내기" />
      <section className="surface rounded-[var(--radius-md)] p-5">
        <h2 className="type-display text-lg font-extrabold">JSON 파일 생성</h2>
        <p className="mt-2 max-w-prose text-sm leading-6 text-muted">
          지원 건, 수신함 후보, 타임라인, 할 일, Q&A, 문서 메타데이터를 포함합니다.
        </p>
        <div className="mt-5">
          <LinkButton href="/api/export">JSON Export</LinkButton>
        </div>
      </section>
    </AppShell>
  );
}
