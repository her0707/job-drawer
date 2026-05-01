"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [isSigningOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button className={className} disabled={isSigningOut} onClick={signOut} type="button" variant="ghost">
      <LogOut aria-hidden className="h-4 w-4" />
      {isSigningOut ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
