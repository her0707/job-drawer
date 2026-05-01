import Link from "next/link";
import { DateTimeText } from "@/components/common/DateTimeText";
import type { Application, Todo } from "@/types/domain";

export function TodoList({ todos, applications = [] }: { todos: Todo[]; applications?: Application[] }) {
  const applicationMap = new Map(applications.map((application) => [application.id, application]));

  if (todos.length === 0) {
    return <p className="inset-panel rounded-[var(--radius-sm)] p-4 text-sm text-muted">열린 할 일이 없습니다.</p>;
  }

  return (
    <div className="grid gap-3">
      {todos.map((todo) => {
        const application = todo.application_id ? applicationMap.get(todo.application_id) : null;
        return (
          <article className="paper rounded-[var(--radius-sm)] p-4" key={todo.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-extrabold text-ink">{todo.title}</h3>
                {application ? (
                  <Link className="mt-1 block text-sm font-semibold text-accent" href={`/applications/${application.id}`}>
                    {application.company} / {application.role}
                  </Link>
                ) : null}
              </div>
              <p className="text-sm text-muted">
                <DateTimeText value={todo.due_at} fallback="마감일 없음" />
              </p>
            </div>
            {todo.description ? <p className="mt-3 text-sm leading-6 text-muted">{todo.description}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
