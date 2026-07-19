"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ইমেজ অনুযায়ী ডামি ডাটা (Jan - Dec)
const data = [
  { name: "Jan", growth: 10 },
  { name: "Feb", growth: 35 },
  { name: "Mar", growth: 30 },
  { name: "Apr", growth: 20 },
  { name: "May", growth: 48 },
  { name: "June", growth: 65 },
  { name: "July", growth: 80 },
  { name: "Aug", growth: 70 },
  { name: "Sep", growth: 78 },
  { name: "Oct", growth: 82 },
  { name: "Nov", growth: 72 },
  { name: "Dec", growth: 118 },
];

export default function RetailerGrowthChart() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => currentYear - index);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  return (
    <div className="w-full rounded-xl border border-[#EFE2C7] p-5 md:p-6 mt-10">
      
      {/* হেডার সেকশন: টাইটেল এবং ডেট ফিল্টার */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base md:text-lg font-semibold tracking-wide text-[#F7E4B3]">
          Retailer Growth
        </h2>
        
        {/* বছর ফিল্টার */}
        <div className="relative flex items-center rounded-lg border border-[#CBA24A]/30 bg-[#140d09]/40 text-[#cca352] transition-colors focus-within:border-[#CBA24A]/70">
          <Calendar className="pointer-events-none ml-3 h-3.5 w-3.5 shrink-0 text-[#CBA24A]" />
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

      {/* রেস্পন্সিভ চার্ট কন্টেইনার */}
      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            {/* গ্রেডিয়েন্ট ইফেক্ট (এরিয়া ফিল করার জন্য) */}
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cca352" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#cca352" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* হরিজন্টাল গ্রিড লাইন (ইমেজ অনুযায়ী শুধু হরিজন্টাল লাইন থাকবে) */}
            <CartesianGrid 
              vertical={false} 
              stroke="#CBA24A" 
              strokeOpacity={0.15} 
            />

            {/* X Axis */}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a8a29e", fontSize: 10 }}
              dy={12}
            />

            {/* Y Axis */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a8a29e", fontSize: 10 }}
              domain={[0, 120]}
              ticks={[0, 30, 60, 90, 120]}
              dx={-5}
            />

            {/* কাস্টম টুলটিপ */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#140d09",
                border: "1px solid rgba(203, 162, 74, 0.4)",
                borderRadius: "8px",
                fontSize: "11px",
              }}
              labelStyle={{ color: "#F7E4B3" }}
              itemStyle={{ color: "#cca352" }}
            />

            {/* স্মুথ কার্ভড এরিয়া */}
            <Area
              type="monotone" // এটি লাইনকে স্মুথ কার্ভ বা সাইন ওয়েভের মতো করবে
              dataKey="growth"
              stroke="#cca352"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorGrowth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
