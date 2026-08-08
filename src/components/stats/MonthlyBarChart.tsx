"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyCount } from "@/types/stats";

const CHART_COLOR = "#22b06a"; // accent-500, coherente con la identidad de marca de la app

export function MonthlyBarChart({ data }: { data: MonthlyCount[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#898781" }}
            axisLine={{ stroke: "#c3c2b7" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#898781" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(34, 176, 106, 0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(11,11,11,0.08)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} camisetas`, ""]}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="count" fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
