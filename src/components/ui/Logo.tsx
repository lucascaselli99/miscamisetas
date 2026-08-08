import { cn } from "@/utils/cn";

/** Isotipo simple de una camiseta, usado como logo de la app. */
export function ShirtMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-8 w-8", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 6L24 9L31 6L40 12.5L35 19L31 16.5V40C31 41.1 30.1 42 29 42H19C17.9 42 17 41.1 17 40V16.5L13 19L8 12.5L17 6Z"
        fill="currentColor"
      />
      <path
        d="M17 6L24 9L31 6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-white">
        <ShirtMark className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-ink-900">Mis Camisetas</span>
    </div>
  );
}
