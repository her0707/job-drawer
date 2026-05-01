"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Field, SelectInput, TextInput } from "@/components/common/Field";
import { getApplicationMatches } from "@/lib/applications/matching";
import { eventDefaultTitles, eventSuggestedTodo, shouldPreselectStatusUpdate } from "@/lib/applications/status";
import type { Application, InboxItem } from "@/types/domain";

export function LinkInboxDialog({ item, applications }: { item: InboxItem; applications: Application[] }) {
  const router = useRouter();
  const matches = useMemo(() => getApplicationMatches(item, applications), [item, applications]);
  const defaultApplicationId = matches[0]?.application.id ?? applications[0]?.id ?? "";
  const [applicationId, setApplicationId] = useState(defaultApplicationId);
  const [createEvent, setCreateEvent] = useState(true);
  const [updateStatus, setUpdateStatus] = useState(
    shouldPreselectStatusUpdate(item.suggested_status, item.confidence)
  );
  const [createTodo, setCreateTodo] = useState(Boolean(item.extracted_action_required));
  const [newCompany, setNewCompany] = useState(item.extracted_company ?? "");
  const [newRole, setNewRole] = useState(item.extracted_role ?? "");
  const [createNewTodo, setCreateNewTodo] = useState(Boolean(item.extracted_action_required));
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLink() {
    setError(null);
    const eventType = item.extracted_event_type ?? "other";
    const response = await fetch(`/api/inbox/${item.id}/link`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        inboxItemId: item.id,
        applicationId,
        createEvent,
        updateApplicationStatus: updateStatus,
        createTodo,
        eventType,
        eventTitle: eventDefaultTitles[eventType],
        eventBody: item.summary,
        occurredAt: item.extracted_event_at ?? item.received_at,
        newStatus: item.suggested_status,
        todoTitle: item.extracted_action_required ?? eventSuggestedTodo[eventType],
        todoDueAt: item.extracted_deadline_at
      })
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error ?? "연결에 실패했습니다.");
      return;
    }
    router.refresh();
  }

  async function onCreateApplication() {
    setError(null);
    setIsCreating(true);
    const response = await fetch(`/api/inbox/${item.id}/create-application`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        company: newCompany,
        role: newRole,
        status: item.suggested_status ?? "applied",
        createTodo: createNewTodo,
        todoTitle: item.extracted_action_required ?? eventSuggestedTodo[item.extracted_event_type ?? "other"],
        todoDueAt: item.extracted_deadline_at
      })
    });
    const json = await response.json();
    setIsCreating(false);
    if (!response.ok) {
      setError(json.error ?? "지원 건 생성에 실패했습니다.");
      return;
    }
    router.push(`/applications/${json.application.id}`);
    router.refresh();
  }

  async function onIgnore() {
    await fetch(`/api/inbox/${item.id}/ignore`, { method: "POST" });
    router.refresh();
  }

  async function onDeleteRaw() {
    await fetch(`/api/inbox/${item.id}/raw`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="surface-flat rounded-[var(--radius-md)] p-4">
      <h3 className="type-display text-base font-extrabold text-ink">수신함에서 지원 건 만들기</h3>
      <div className="mt-4 grid gap-3">
        <div className="inset-panel grid gap-3 rounded-[var(--radius-sm)] p-3">
          <div>
            <p className="text-sm font-extrabold text-ink">새 지원 건으로 생성</p>
            <p className="mt-1 text-xs font-semibold text-muted">파싱된 회사/포지션을 확인한 뒤 바로 상세 화면으로 이동합니다.</p>
          </div>
          <Field label="회사명">
            <TextInput
              onChange={(event) => setNewCompany(event.target.value)}
              placeholder="회사명"
              value={newCompany}
            />
          </Field>
          <Field label="포지션">
            <TextInput
              onChange={(event) => setNewRole(event.target.value)}
              placeholder="포지션 미확인"
              value={newRole}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              checked={createNewTodo}
              onChange={(event) => setCreateNewTodo(event.target.checked)}
              type="checkbox"
            />
            Todo 생성
          </label>
          <Button disabled={!newCompany.trim() || isCreating} onClick={onCreateApplication} type="button">
            {isCreating ? "생성 중..." : "새 지원 건 만들기"}
          </Button>
        </div>

        {applications.length > 0 ? (
          <div className="grid gap-3 border-t border-line pt-4">
            <h4 className="text-sm font-extrabold text-ink">기존 지원 건에 연결</h4>
            {matches.length > 0 ? (
              <div className="grid gap-2">
                {matches.map((match) => (
                  <button
                    className="focus-ring inset-panel rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm transition hover:border-accent"
                    key={match.application.id}
                    onClick={() => setApplicationId(match.application.id)}
                    type="button"
                  >
                    <span className="font-extrabold">{match.application.company}</span> / {match.application.role}
                    <span className="ml-2 text-xs font-semibold text-muted">score {match.score}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <Field label="연결할 지원 건">
              <SelectInput onChange={(event) => setApplicationId(event.target.value)} value={applicationId}>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.company} / {application.role}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input checked={createEvent} onChange={(event) => setCreateEvent(event.target.checked)} type="checkbox" />
              Timeline Event 생성
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input checked={updateStatus} onChange={(event) => setUpdateStatus(event.target.checked)} type="checkbox" />
              추천 상태로 변경
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input checked={createTodo} onChange={(event) => setCreateTodo(event.target.checked)} type="checkbox" />
              Todo 생성
            </label>
            {item.extracted_action_required ? (
              <Field label="추천 Todo">
                <TextInput readOnly value={item.extracted_action_required} />
              </Field>
            ) : null}
            <Button disabled={!applicationId} onClick={onLink} type="button">
              기존 지원 건에 연결
            </Button>
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex flex-wrap justify-end gap-2">
          {item.raw_text ? (
            <Button onClick={onDeleteRaw} type="button" variant="ghost">
              원문 삭제
            </Button>
          ) : null}
          <Button onClick={onIgnore} type="button" variant="ghost">
            무시
          </Button>
        </div>
      </div>
    </section>
  );
}
