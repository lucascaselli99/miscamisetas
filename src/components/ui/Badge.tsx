import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "neutral" | "accent" | "favorite";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-ink-900/[0.06] text-ink-700",
  accent: "bg-accent-100 text-accent-700",
  favorite: "bg-favorite-500/10 text-favorite-500",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
