"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { startGoogleGmailLogin } from "@/lib/auth/google";

export function GmailIntegrationPanel({
  email,
  hasAccount,
  hasRefreshToken
}: {
  email: string | null;
  hasAccount: boolean;
  hasRefreshToken: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setSyncing] = useState(false);
  const [isReconnecting, setReconnecting] = useState(false);

  async function sync() {
    setSyncing(true);
    setMessage(null);
    const response = await fetch("/api/gmail/sync", { method: "POST" });
    const json = await response.json();
    setSyncing(false);
    setMessage(response.ok ? `동기화 완료: ${json.createdInboxCount}개 후보 생성` : json.error);
    router.refresh();
  }

  async function reconnect() {
    setReconnecting(true);
    setMessage(null);
    const { error } = await startGoogleGmailLogin("/settings/integrations");

    if (error) {
      setMessage(error.message);
      setReconnecting(false);
    }
  }

  return (
    <section className="surface rounded-[var(--radius-md)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="type-display text-lg font-extrabold">Gmail</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-muted">
            {hasAccount
              ? `${email ?? "Google 계정"} 권한이 연결되었습니다. 동기화는 연결 이후 수신된 메일만 후보로 만듭니다.`
              : "Google로 로그인하면 Gmail 읽기 권한을 함께 받아 연결 이후 수신된 메일만 후보로 만듭니다."}
          </p>
          {hasAccount && !hasRefreshToken ? (
            <p className="mt-2 text-sm font-semibold text-danger">지속 동기화 권한이 없어 Google 권한을 다시 받아야 합니다.</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          {!hasAccount || !hasRefreshToken ? (
            <Button disabled={isReconnecting} onClick={reconnect} type="button" variant="secondary">
              {isReconnecting ? "Google로 이동 중..." : "Google 권한 다시 받기"}
            </Button>
          ) : null}
          <Button disabled={!hasAccount || !hasRefreshToken || isSyncing} onClick={sync} type="button">
            {isSyncing ? "동기화 중..." : "동기화"}
          </Button>
        </div>
      </div>
      {message ? <p className="inset-panel mt-4 rounded-[var(--radius-sm)] p-3 text-sm font-semibold text-muted">{message}</p> : null}
    </section>
  );
}
