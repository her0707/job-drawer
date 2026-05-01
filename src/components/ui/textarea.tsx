import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "focus-ring flex min-h-32 w-full rounded-[var(--radius-md)] border border-line bg-panel2 px-4 py-3 text-sm text-ink transition-colors placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent focus:bg-panel",
        className
      )}
      {...props}
    />
  );
}
