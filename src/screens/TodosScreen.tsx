import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { TodoList } from "@/features/todos/components/TodoList";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export async function TodosScreen() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const [todos, applications] = await Promise.all([
    supabase.from("todos").select("*").eq("user_id", user.id).order("due_at", { ascending: true }),
    supabase.from("applications").select("*").eq("user_id", user.id)
  ]);

  return (
    <AppShell>
      <PageHeader description="면접 준비, 과제 제출, 회신 등 다음 액션을 모아봅니다." title="할 일" />
      <TodoList applications={applications.data ?? []} todos={todos.data ?? []} />
    </AppShell>
  );
}
