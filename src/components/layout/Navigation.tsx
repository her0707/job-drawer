"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, CheckSquare, Home, Inbox, Settings, type LucideIcon } from "lucide-react";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "대시보드", shortLabel: "홈", icon: Home },
  { href: "/applications", label: "지원 현황", shortLabel: "지원", icon: BriefcaseBusiness },
  { href: "/inbox", label: "수신함", shortLabel: "수신함", icon: Inbox },
  { href: "/todos", label: "할 일", shortLabel: "할 일", icon: CheckSquare },
  { href: "/settings", label: "설정", shortLabel: "설정", icon: Settings }
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-panel px-5 py-6 md:flex md:flex-col">
      <Link href="/dashboard" className="block">
        <h1 className="type-display text-[1.45rem] font-black leading-none text-ink">지원로그</h1>
        <p className="mt-2 text-xs font-bold text-muted">지원 관리가 쉬운 기록</p>
      </Link>
      <nav className="mt-8 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              className={`focus-ring flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm font-extrabold transition ${
                active ? "bg-accent text-accentInk" : "text-muted hover:bg-panel2 hover:text-ink"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-line pt-4">
        <SignOutButton className="w-full justify-start px-3.5" />
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-panel px-2 pb-2 pt-1 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            className={`focus-ring grid justify-items-center gap-1 rounded-[var(--radius-md)] px-2 py-2 text-[11px] font-extrabold ${
              active ? "bg-accent text-accentInk" : "text-muted"
            }`}
            href={item.href}
            key={item.href}
          >
            <Icon aria-hidden className="h-5 w-5" />
            <span>{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
