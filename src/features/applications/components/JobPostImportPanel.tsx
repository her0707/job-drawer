"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Field, SelectInput, TextInput } from "@/components/common/Field";
import type { JobPostPreview, JobPostProvider } from "@/lib/job-posts";
import type { ApplicationChannel } from "@/types/domain";

export type ApplicationFormPrefill = {
  company?: string;
  role?: string;
  channel?: ApplicationChannel;
  deadline_at?: string | null;
  job_post_url?: string | null;
  job_post_snapshot?: string | null;
  memo?: string | null;
};

const providerLabels: Record<JobPostProvider, string> = {
  wanted: "원티드"
};

function toPrefill(jobPost: JobPostPreview): ApplicationFormPrefill {
  return {
    company: jobPost.company,
    role: jobPost.role,
    channel: jobPost.channel,
    deadline_at: jobPost.deadlineAt?.slice(0, 10) ?? null,
    job_post_url: jobPost.url,
    job_post_snapshot: jobPost.snapshot,
    memo: jobPost.summary
  };
}

export function JobPostImportPanel({ onLoaded }: { onLoaded: (prefill: ApplicationFormPrefill) => void }) {
  const [provider, setProvider] = useState<JobPostProvider>("wanted");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const response = await fetch("/api/job-posts/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider, url })
    });
    const json = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(json.error ?? "공고 정보를 불러오지 못했습니다.");
      return;
    }

    onLoaded(toPrefill(json.jobPost));
    setMessage(`${json.jobPost.company} / ${json.jobPost.role} 정보를 불러왔습니다.`);
  }

  return (
    <form className="surface-flat grid gap-4 rounded-[var(--radius-md)] p-5" onSubmit={onSubmit}>
      <div>
        <h2 className="type-display text-lg font-extrabold text-ink">채용공고 링크 불러오기</h2>
        <p className="mt-1 text-sm leading-6 text-muted">채용사이트와 공고 URL을 입력하면 새 지원 건 폼을 채웁니다.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
        <Field label="채용사이트">
          <SelectInput onChange={(event) => setProvider(event.target.value as JobPostProvider)} value={provider}>
            <option value="wanted">{providerLabels.wanted}</option>
          </SelectInput>
        </Field>
        <Field label="공고 URL">
          <TextInput
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.wanted.co.kr/wd/..."
            type="url"
            value={url}
          />
        </Field>
        <Button disabled={isLoading || !url.trim()} type="submit">
          {isLoading ? "불러오는 중..." : "불러오기"}
        </Button>
      </div>
      {error ? <p className="inset-panel rounded-[var(--radius-sm)] p-3 text-sm font-semibold text-danger">{error}</p> : null}
      {message ? <p className="inset-panel rounded-[var(--radius-sm)] p-3 text-sm font-semibold text-accent">{message}</p> : null}
    </form>
  );
}
