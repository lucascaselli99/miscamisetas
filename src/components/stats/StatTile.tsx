import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: boolean;
}

export function StatTile({ label, value, icon, accent }: StatTileProps) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-500">{label}</span>
        {icon && (
          <span className={cn("text-ink-300", accent && "text-accent-500")}>{icon}</span>
        )}
      </div>
      <span className="text-2xl font-semibold tracking-tight text-ink-900">{value}</span>
    </Card>
  );
}
