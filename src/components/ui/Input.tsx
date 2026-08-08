"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "input-base",
            error && "border-favorite-500 focus:border-favorite-500 focus:ring-favorite-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-favorite-500">{error}</p>}
        {!error && hint && <p className="text-sm text-ink-300">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
