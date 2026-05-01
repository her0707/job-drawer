import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { InboxItemCard } from "@/features/inbox/components/InboxItemCard";
import { LinkInboxDialog } from "@/features/inbox/components/LinkInboxDialog";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export async function InboxScreen() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const [inboxItems, applications] = await Promise.all([
    supabase
      .from("inbox_items")
      .select("*")
      .eq("user_id", user.id)
      .order("received_at", { ascending: false }),
    supabase.from("applications").select("*").eq("user_id", user.id).order("updated_at", { ascending: false })
  ]);

  const items = inboxItems.data ?? [];

  return (
    <AppShell>
      <PageHeader
        action={<LinkButton href="/inbox/new">붙여넣기</LinkButton>}
        description="외부 입력은 먼저 수신함 후보로 저장한 뒤 사용자가 지원 건에 연결합니다."
        title="수신함"
      />
      {items.length === 0 ? (
        <EmptyState
          action={<LinkButton href="/inbox/new">첫 메시지 붙여넣기</LinkButton>}
          description="카카오톡, 문자, DM, 수동 메모를 붙여넣어 후보를 만들 수 있습니다."
          title="수신함 후보가 없습니다"
        />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div className="grid gap-3 lg:grid-cols-[1fr_360px]" key={item.id}>
              <InboxItemCard item={item} />
              {item.status === "pending" || item.status === "needs_review" ? (
                <LinkInboxDialog applications={applications.data ?? []} item={item} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
