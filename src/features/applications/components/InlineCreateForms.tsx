"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/common/Field";
import { eventTypes } from "@/types/domain";
import { eventLabels } from "@/lib/applications/status";

async function postJson(url: string, payload: Record<string, FormDataEntryValue>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "")))
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "저장에 실패했습니다.");
}

export function EventCreateForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await postJson(`/api/applications/${applicationId}/events`, Object.fromEntries(new FormData(event.currentTarget)));
      event.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  }

  return (
    <form className="inset-panel grid gap-3 rounded-[var(--radius-sm)] p-4" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="이벤트 유형">
          <SelectInput name="event_type">
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {eventLabels[type]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="일시">
          <TextInput name="occurred_at" type="datetime-local" />
        </Field>
      </div>
      <Field label="제목">
        <TextInput name="title" required />
      </Field>
      <Field label="내용">
        <TextArea name="body" />
      </Field>
      {error ? <p className="text-sm font-semibold text-danger">{error}</p> : null}
      <Button className="justify-self-end" type="submit" variant="secondary">
        이벤트 추가
      </Button>
    </form>
  );
}

export function TodoCreateForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await postJson(`/api/applications/${applicationId}/todos`, Object.fromEntries(new FormData(event.currentTarget)));
      event.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  }

  return (
    <form className="inset-panel grid gap-3 rounded-[var(--radius-sm)] p-4" onSubmit={onSubmit}>
      <Field label="할 일">
        <TextInput name="title" required />
      </Field>
      <Field label="마감일">
        <TextInput name="due_at" type="datetime-local" />
      </Field>
      {error ? <p className="text-sm font-semibold text-danger">{error}</p> : null}
      <Button className="justify-self-end" type="submit" variant="secondary">
        할 일 추가
      </Button>
    </form>
  );
}

export function QACreateForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await postJson(`/api/applications/${applicationId}/qa`, Object.fromEntries(new FormData(event.currentTarget)));
      event.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  }

  return (
    <form className="inset-panel grid gap-3 rounded-[var(--radius-sm)] p-4" onSubmit={onSubmit}>
      <Field label="질문">
        <TextInput name="question" required />
      </Field>
      <Field label="제출 답변">
        <TextArea name="answer" required />
      </Field>
      {error ? <p className="text-sm font-semibold text-danger">{error}</p> : null}
      <Button className="justify-self-end" type="submit" variant="secondary">
        Q&A 추가
      </Button>
    </form>
  );
}
