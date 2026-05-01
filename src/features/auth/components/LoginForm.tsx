"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { startGoogleGmailLogin } from "@/lib/auth/google";

export function LoginForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function onGoogleLogin() {
    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await startGoogleGmailLogin();

      if (error) {
        setMessage(error.message);
        setSubmitting(false);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "로그인 요청에 실패했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <section className="surface grid gap-5 rounded-[var(--radius-md)] p-6 sm:p-7">
      <div>
        <p className="eyebrow">로그인</p>
        <h2 className="type-display mt-2 text-2xl font-black text-ink">Google로 시작하기</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Gmail 읽기 권한으로 지원 관련 메일을 수신함 후보로 가져옵니다.
        </p>
      </div>
      <Button className="w-full" disabled={isSubmitting} onClick={onGoogleLogin} type="button">
        {isSubmitting ? "Google로 이동 중..." : "Google로 시작하기"}
      </Button>
      {message ? <p className="inset-panel rounded-[var(--radius-sm)] p-3 text-sm font-semibold text-muted">{message}</p> : null}
    </section>
  );
}
