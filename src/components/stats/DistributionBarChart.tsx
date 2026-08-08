"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DistributionItem } from "@/types/stats";

const CHART_COLOR = "#2a78d6"; // azul secuencial (paleta validada), distinto del acento para diferenciar bloques

export function DistributionBarChart({ data }: { data: DistributionItem[] }) {
  // Truncamos labels largos para que entren en el eje sin romper el layout.
  const chartData = data.map((d) => ({
    ...d,
    shortLabel: d.label.length > 14 ? `${d.label.slice(0, 13)}…` : d.label,
  }));

  return (
    <div style={{ height: Math.max(160, chartData.length * 34) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#898781" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortLabel"
            tick={{ fontSize: 12, fill: "#403e3b" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "rgba(42, 120, 214, 0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(11,11,11,0.08)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} camisetas`, ""]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
          />
          <Bar dataKey="count" fill={CHART_COLOR} radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
