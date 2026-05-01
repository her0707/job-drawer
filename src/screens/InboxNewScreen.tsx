import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PasteInboxForm } from "@/features/inbox/components/PasteInboxForm";
import { requireUser } from "@/lib/supabase/auth";

export async function InboxNewScreen() {
  await requireUser();

  return (
    <AppShell>
      <PageHeader
        description="카카오톡, 문자, DM, 수동 메모를 붙여넣으면 규칙 기반 파서가 후보 정보를 추출합니다."
        title="메시지 붙여넣기"
      />
      <PasteInboxForm />
    </AppShell>
  );
}
