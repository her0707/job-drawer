import { LinkButton } from "@/components/common/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="surface max-w-md rounded-[var(--radius-md)] p-8 text-center">
        <p className="eyebrow">404</p>
        <h1 className="type-display mt-3 text-2xl font-extrabold text-ink">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          요청한 화면이 없거나 이동되었습니다. 대시보드에서 다시 시작하세요.
        </p>
        <div className="mt-6">
          <LinkButton href="/dashboard">대시보드로 이동</LinkButton>
        </div>
      </section>
    </main>
  );
}
