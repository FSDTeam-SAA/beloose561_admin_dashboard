"use client";

import React from "react";
import { 
  Store, 
  UserCheck, 
  Database, 
  ClipboardCheck, 
  Users, 
  QrCode 
} from "lucide-react";

// ডামি ডাটা স্ট্রাকচার
const statsData = [
  {
    id: 1,
    title: "Total Retailers",
    value: "112",
    icon: Store,
  },
  {
    id: 2,
    title: "Active Retailers",
    value: "98",
    icon: UserCheck,
  },
  {
    id: 3,
    title: "Master Database",
    value: "4,241",
    icon: Database,
  },
  {
    id: 4,
    title: "Pending Approvals",
    value: "23",
    icon: ClipboardCheck,
  },
  {
    id: 5,
    title: "Total Users",
    value: "389",
    icon: Users,
  },
  {
    id: 6,
    title: "Customer QR Scans",
    value: "7,230",
    icon: QrCode,
  },
];

export default function OverviewStates() {
  return (
    <div className="w-full">
      {/* রেস্পন্সিভ গ্রিড লেআউট */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="relative overflow-hidden rounded-[12px] border border-[#EFE2C7] bg-[#332211]  p-5 flex flex-col justify-between min-h-[140px] transition-all hover:border-[#CBA24A]/80"
            >
              {/* উপরের অংশ: টাইটেল এবং আইকন */}
              <div className="flex items-start justify-between w-full">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">
                  {stat.title}
                </p>
                <div className="text-[#CBA24A]/80 group-hover:text-[#CBA24A] transition-colors p-1.5 rounded-lg bg-[#140d09]/40 border border-[#CBA24A]/20">
                  <Icon className="h-5 w-5 stroke-[1.5]" />
                </div>
              </div>

              {/* নিচের অংশ: বড় ভ্যালু টেক্সট */}
              <div className="mt-4">
                <h3 className="text-3xl md:text-4xl font-serif font-medium text-[#F7E4B3] tracking-wide">
                  {stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}