import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { requireUser } from "@/lib/supabase/auth";

export async function SettingsScreen() {
  await requireUser();

  return (
    <AppShell>
      <PageHeader description="연동, 내보내기, 데이터 관리 설정을 확인합니다." title="설정" />
      <div className="grid gap-3 sm:grid-cols-2">
        <SettingsLink href="/settings/integrations" title="연동 관리" description="Gmail 연동과 동기화 상태" />
        <SettingsLink href="/settings/export" title="데이터 내보내기" description="사용자 데이터 JSON 내보내기" />
      </div>
      <section className="surface mt-6 rounded-[var(--radius-md)] p-5 md:hidden">
        <h2 className="type-display text-lg font-extrabold">계정</h2>
        <p className="mt-2 text-sm text-muted">현재 기기에서 세션을 종료합니다.</p>
        <div className="mt-4">
          <SignOutButton className="w-full" />
        </div>
      </section>
    </AppShell>
  );
}

function SettingsLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link className="focus-ring surface rounded-[var(--radius-md)] p-5 transition hover:-translate-y-0.5 hover:shadow-lift" href={href}>
      <h2 className="type-display text-lg font-extrabold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </Link>
  );
}
