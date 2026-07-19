"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartItem {
  month: string;
  totalRevenue: number;
}

interface ChartResponse {
  success: boolean;
  message?: string;
  data?: {
    year: number;
    summary: { totalRevenue: number };
    chartData: ChartItem[];
  };
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function RetailerGrowthChart() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => currentYear - index);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  const chartQuery = useQuery({
    queryKey: ["dashboard-chart", selectedYear],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(
        `${getApiBaseUrl()}/dashboard/chart?year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response.json().catch(() => null)) as ChartResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to load earning chart.");
      }
      return result.data;
    },
  });

  return (
    <div className="mt-10 w-full rounded-xl border border-[#EFE2C7] p-5 md:p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-wide text-[#F7E4B3] md:text-lg">
            Retailer Revenue
          </h2>
          <p className="mt-1 text-xs text-stone-400">
            Total revenue: ${chartQuery.data?.summary.totalRevenue.toLocaleString() ?? "0"}
          </p>
        </div>
        <div className="relative flex items-center rounded border border-[#CBA24A]/30 bg-[#140d09]/40 text-[#cca352] focus-within:border-[#CBA24A]/70">
          <Calendar className="pointer-events-none ml-3 h-3.5 w-3.5 text-[#CBA24A]" />
          <select
            aria-label="Select chart year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="h-8 cursor-pointer appearance-none bg-transparent pl-2 pr-8 text-[11px] font-medium text-[#cca352] outline-none"
          >
            {years.map((year) => (
              <option key={year} value={year} className="bg-[#2A1E10] text-[#F7E4B3]">
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#CBA24A]" />
        </div>
      </div>

      {chartQuery.isError ? (
        <div className="flex h-[250px] items-center justify-center text-sm text-red-400 md:h-[300px]">
          {chartQuery.error.message}
        </div>
      ) : chartQuery.isLoading ? (
        <div className="flex h-[250px] items-center justify-center text-sm text-stone-400 md:h-[300px]">
          Loading chart...
        </div>
      ) : (
        <div className="h-[250px] w-full md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartQuery.data?.chartData ?? []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cca352" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#cca352" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#CBA24A" strokeOpacity={0.15} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#a8a29e", fontSize: 10 }} dy={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a8a29e", fontSize: 10 }} dx={-5} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                contentStyle={{ backgroundColor: "#140d09", border: "1px solid rgba(203, 162, 74, 0.4)", borderRadius: "8px", fontSize: "11px" }}
                labelStyle={{ color: "#F7E4B3" }}
                itemStyle={{ color: "#cca352" }}
              />
              <Area type="monotone" dataKey="totalRevenue" stroke="#cca352" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
