"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/common/Field";
import { applicationChannels, applicationStatuses, type Application } from "@/types/domain";
import { channelLabels, statusLabels } from "@/lib/applications/status";
import { JobPostImportPanel, type ApplicationFormPrefill } from "./JobPostImportPanel";

type ApplicationFormValues = Application | ApplicationFormPrefill;

function getValue(values: ApplicationFormValues | null, key: keyof ApplicationFormPrefill) {
  const value = values?.[key];
  return typeof value === "string" ? value : "";
}

export function ApplicationForm({ application }: { application?: Application }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [prefill, setPrefill] = useState<ApplicationFormPrefill | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const values = application ?? prefill;

  function onJobPostLoaded(nextPrefill: ApplicationFormPrefill) {
    setPrefill(nextPrefill);
    setFormVersion((version) => version + 1);
  }

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
    <div className="grid gap-5">
      {!application ? <JobPostImportPanel onLoaded={onJobPostLoaded} /> : null}
      <form
        className="surface grid gap-5 rounded-[var(--radius-md)] p-5"
        key={application?.id ?? formVersion}
        onSubmit={onSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="회사명">
            <TextInput defaultValue={getValue(values, "company")} name="company" required />
          </Field>
          <Field label="포지션">
            <TextInput defaultValue={getValue(values, "role")} name="role" required />
          </Field>
          <Field label="채널">
            <SelectInput defaultValue={getValue(values, "channel") || "other"} name="channel">
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
            <TextInput
              defaultValue={application?.deadline_at?.slice(0, 10) ?? getValue(values, "deadline_at")}
              name="deadline_at"
              type="date"
            />
          </Field>
          <Field label="공고 URL">
            <TextInput defaultValue={getValue(values, "job_post_url")} name="job_post_url" type="url" />
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
          <TextArea defaultValue={getValue(values, "memo")} name="memo" />
        </Field>
        <Field label="공고 스냅샷">
          <TextArea defaultValue={getValue(values, "job_post_snapshot")} name="job_post_snapshot" rows={10} />
        </Field>
        {error ? (
          <p className="inset-panel rounded-[var(--radius-sm)] p-3 text-sm font-semibold text-danger">{error}</p>
        ) : null}
        <div className="flex justify-end">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
