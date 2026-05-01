import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-extrabold transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-accentInk hover:bg-accent/90",
        primary: "bg-accent text-accentInk hover:bg-accent/90",
        destructive: "bg-danger text-accentInk hover:bg-danger/90",
        danger: "bg-danger text-accentInk hover:bg-danger/90",
        outline: "border border-lineStrong bg-panel text-ink hover:border-accent hover:bg-panel2",
        secondary: "border border-lineStrong bg-panel text-ink hover:border-accent hover:bg-panel2",
        ghost: "text-muted hover:bg-panel2 hover:text-ink",
        link: "min-h-0 rounded-none px-0 py-0 text-ink underline-offset-4 hover:underline"
      },
      size: {
        default: "min-h-11 px-5 py-2.5",
        sm: "min-h-9 px-3 py-2 text-xs",
        lg: "min-h-12 px-6 py-3",
        icon: "h-10 min-h-10 w-10 px-0 py-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
