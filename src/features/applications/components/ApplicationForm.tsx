"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/common/Field";
import { applicationChannels, applicationStatuses, type Application } from "@/types/domain";
import { channelLabels, statusLabels } from "@/lib/applications/status";

export function ApplicationForm({ application }: { application?: Application }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const url = application ? `/api/applications/${application.id}` : "/api/applications";
    const response = await fetch(url, {
      method: application ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(json.error ?? "저장에 실패했습니다.");
      return;
    }

    router.push(`/applications/${json.application.id}`);
    router.refresh();
  }

  return (
    <form className="surface grid gap-5 rounded-[var(--radius-md)] p-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="회사명">
          <TextInput defaultValue={application?.company} name="company" required />
        </Field>
        <Field label="포지션">
          <TextInput defaultValue={application?.role} name="role" required />
        </Field>
        <Field label="채널">
          <SelectInput defaultValue={application?.channel ?? "other"} name="channel">
            {applicationChannels.map((channel) => (
              <option key={channel} value={channel}>
                {channelLabels[channel]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="상태">
          <SelectInput defaultValue={application?.status ?? "planned"} name="status">
            {applicationStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="지원일">
          <TextInput defaultValue={application?.applied_at?.slice(0, 10)} name="applied_at" type="date" />
        </Field>
        <Field label="마감일">
          <TextInput defaultValue={application?.deadline_at?.slice(0, 10)} name="deadline_at" type="date" />
        </Field>
        <Field label="공고 URL">
          <TextInput defaultValue={application?.job_post_url ?? ""} name="job_post_url" type="url" />
        </Field>
        <Field label="우선순위">
          <TextInput defaultValue={application?.priority ?? 3} max={5} min={1} name="priority" type="number" />
        </Field>
        <Field label="이력서 버전">
          <TextInput defaultValue={application?.resume_version ?? ""} name="resume_version" />
        </Field>
        <Field label="포트폴리오 버전">
          <TextInput defaultValue={application?.portfolio_version ?? ""} name="portfolio_version" />
        </Field>
      </div>
      <Field label="다음 액션">
        <TextInput defaultValue={application?.next_action ?? ""} name="next_action" />
      </Field>
      <Field label="메모">
        <TextArea defaultValue={application?.memo ?? ""} name="memo" />
      </Field>
      {error ? <p className="inset-panel rounded-[var(--radius-sm)] p-3 text-sm font-semibold text-danger">{error}</p> : null}
      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
