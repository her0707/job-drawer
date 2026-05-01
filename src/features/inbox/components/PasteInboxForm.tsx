"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/common/Field";
import type { ParsedInboxItem } from "@/lib/parser";
import { inboxSources } from "@/types/domain";
import { ParsedPreview } from "./ParsedPreview";

export function PasteInboxForm() {
  const router = useRouter();
  const [parsed, setParsed] = useState<ParsedInboxItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function submit(formElement: HTMLFormElement, save: boolean) {
    setSubmitting(true);
    setError(null);

    const form = new FormData(formElement);
    const payload = {
      source: form.get("source"),
      title: form.get("title"),
      sender: form.get("sender"),
      receivedAt: form.get("receivedAt"),
      rawText: form.get("rawText"),
      save
    };

    const response = await fetch("/api/inbox/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(json.error ?? "분석에 실패했습니다.");
      return;
    }

    setParsed(json.parsed);
    if (save) {
      router.push("/inbox");
      router.refresh();
    }
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit(event.currentTarget, false);
      }}
    >
      <section className="surface grid gap-5 rounded-[var(--radius-md)] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="출처">
            <SelectInput name="source">
              {inboxSources
                .filter((source) => source !== "gmail")
                .map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
            </SelectInput>
          </Field>
          <Field label="수신일">
            <TextInput name="receivedAt" type="datetime-local" />
          </Field>
          <Field label="제목">
            <TextInput name="title" />
          </Field>
          <Field label="발신자">
            <TextInput name="sender" />
          </Field>
        </div>
        <Field label="원문">
          <TextArea name="rawText" required />
        </Field>
        {error ? <p className="inset-panel rounded-[var(--radius-sm)] p-3 text-sm font-semibold text-danger">{error}</p> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button disabled={isSubmitting} type="submit" variant="secondary">
            분석 미리보기
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={(event) => {
              if (event.currentTarget.form) submit(event.currentTarget.form, true);
            }}
            type="button"
          >
            분석하고 수신함에 추가
          </Button>
        </div>
      </section>
      {parsed ? <ParsedPreview parsed={parsed} /> : null}
    </form>
  );
}
