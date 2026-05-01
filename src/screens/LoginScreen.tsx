import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginScreen() {
  return (
    <main className="min-h-screen bg-panel px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex h-14 items-center">
          <div>
            <p className="type-display text-xl font-black text-ink">지원로그</p>
          </div>
        </header>
        <section className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1fr_420px] lg:py-12">
          <div className="max-w-2xl">
            <h1 className="type-display text-[2.8rem] font-black leading-[1.08] text-ink sm:text-[4.2rem]">
              지원 기록을
              <br />한 곳에서.
            </h1>
            <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-muted">
              회사별 지원 현황과 다음 할 일을 간단하게 정리합니다.
            </p>
          </div>
          <div className="w-full">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
