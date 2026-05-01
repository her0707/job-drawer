import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { ApplicationCard } from "@/features/applications/components/ApplicationCard";
import { ApplicationTable } from "@/features/applications/components/ApplicationTable";

export async function ApplicationsScreen() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  const applications = data ?? [];

  return (
    <AppShell>
      <PageHeader
        action={<LinkButton href="/applications/new">새 지원 건</LinkButton>}
        description="회사와 포지션 단위로 지원 현황을 관리합니다."
        title="지원 현황"
      />
      {applications.length === 0 ? (
        <EmptyState
          action={<LinkButton href="/applications/new">첫 지원 건 만들기</LinkButton>}
          description="지원한 회사, 포지션, 상태, 다음 액션을 먼저 기록해보세요."
          title="아직 지원 건이 없습니다"
        />
      ) : (
        <>
          <ApplicationTable applications={applications} />
          <div className="grid gap-3 md:hidden">
            {applications.map((application) => (
              <ApplicationCard application={application} key={application.id} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
