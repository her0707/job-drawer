import type { ReactNode } from "react";
import { MobileBottomNav, SidebarNav } from "./Navigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SidebarNav />
      <main className="pb-24 md:ml-60 md:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 md:px-8 md:py-8">{children}</div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
