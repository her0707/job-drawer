import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { buttonVariants, Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = ShadcnButtonProps & {
  variant?: ShadcnButtonProps["variant"];
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return <ShadcnButton variant={variant} {...props} />;
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export function LinkButton({ className, variant = "primary", size, href, ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      href={href}
      {...props}
    />
  );
}
