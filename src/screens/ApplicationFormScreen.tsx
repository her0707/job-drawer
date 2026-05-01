import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ApplicationForm } from "@/features/applications/components/ApplicationForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export async function ApplicationFormScreen({ id }: { id?: string }) {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const application = id
    ? await supabase.from("applications").select("*").eq("id", id).eq("user_id", user.id).single()
    : null;

  if (id && !application?.data) notFound();

  return (
    <AppShell>
      <PageHeader
        description="회사, 포지션, 상태, 다음 액션을 기록합니다."
        title={id ? "지원 건 수정" : "새 지원 건"}
      />
      <ApplicationForm application={application?.data ?? undefined} />
    </AppShell>
  );
}
