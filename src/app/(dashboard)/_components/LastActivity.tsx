"use client";

import React from "react";
import Link from "next/link";

// Latest Product Submissions ডামি ডাটা
const productSubmissions = [
  {
    id: 1,
    name: "Reserva Especial Toro",
    source: "Casa del Habano NYC",
    date: "Jul 3, 2025",
    status: "Pending",
  },
  {
    id: 2,
    name: "Gran Corona Edición Limitada",
    source: "The Cigar House",
    date: "Jul 4, 2025",
    status: "Pending",
  },
  {
    id: 3,
    name: "Vintage 2018 Robusto",
    source: "Premium Leaf Co.",
    date: "Jul 5, 2025",
    status: "Pending",
  },
  {
    id: 4,
    name: "Habana Reserve Churchill",
    source: "Havana Club Boston",
    date: "Jul 6, 2025",
    status: "Under Review",
  },
];

// Recent Platform Activity ডামি ডাটা
const platformActivities = [
  {
    id: 1,
    activity: "New retailer registered",
    details: "Montecristo Room — Las Vegas, NV",
    time: "2 min ago",
  },
  {
    id: 2,
    activity: "Product approved",
    details: "Vintage 2018 Churchill added...",
    time: "14 min ago",
  },
  {
    id: 3,
    activity: "Product submission",
    details: "Reserva Especial Toro by Casa del...",
    time: "1 hr ago",
  },
  {
    id: 4,
    activity: "New Item Arrived",
    details: "The Smoke Lounge → Premium",
    time: "Yesterday",
  },
];

export default function LastActivity() {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5 rounded-2xl mt-10">
      
      {/* ১. Latest Product Submissions কার্ড */}
      <div className="rounded-xl border border-[#EFE2C7] p-5 md:p-6 flex flex-col justify-between">
        <div>
          {/* হেডার */}
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-sm md:text-base font-semibold tracking-wide text-[#F7E4B3]">
              Latest Product Submissions
            </h2>
            <Link 
              href="/submissions" 
              className="text-[#cca352] hover:underline text-xs font-medium tracking-wide"
            >
              View All
            </Link>
          </div>

          {/* লিস্ট আইটেমসমূহ */}
          <div className="flex flex-col">
            {productSubmissions.map((item, idx) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between py-4 ${
                  idx !== productSubmissions.length - 1 ? "border-b border-[#705929]" : ""
                }`}
              >
                {/* প্রোডাক্ট নাম */}
                <div className="flex-1 pr-4">
                  <p className="text-xs md:text-[13px] font-semibold text-[#F7E4B3]/90 truncate">
                    {item.name}
                  </p>
                </div>

                {/* সোর্স এবং ডেট */}
                <div className="hidden sm:block flex-1 text-center pr-4">
                  <p className="text-[10px] md:text-xs text-stone-500 truncate">
                    {item.source} <span className="mx-1">•</span> {item.date}
                  </p>
                </div>

                {/* স্ট্যাটাস */}
                <div className="w-[100px] text-right">
                  <span className={`text-[11px] md:text-xs font-medium ${
                    item.status === "Pending" ? "text-[#cca352]" : "text-stone-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ২. Recent Platform Activity কার্ড */}
      <div className="rounded-xl border border-[#EFE2C7] p-5 md:p-6 flex flex-col justify-between">
        <div>
          {/* হেডার */}
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-sm md:text-base font-semibold tracking-wide text-[#F7E4B3]">
              Recent Platform Activity
            </h2>
            <Link 
              href="/activity" 
              className="text-[#cca352] hover:underline text-xs font-medium tracking-wide"
            >
              View All
            </Link>
          </div>

          {/* লিস্ট আইটেমসমূহ */}
          <div className="flex flex-col">
            {platformActivities.map((item, idx) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between py-4 ${
                  idx !== platformActivities.length - 1 ? "border-b border-[#705929]" : ""
                }`}
              >
                {/* অ্যাক্টিভিটি টাইটেল */}
                <div className="flex-1 pr-4">
                  <p className="text-xs md:text-[13px] font-semibold text-[#F7E4B3]/90 truncate">
                    {item.activity}
                  </p>
                </div>

                {/* ডিটেইলস */}
                <div className="hidden sm:block flex-1 text-center pr-4">
                  <p className="text-[10px] md:text-xs text-stone-500 truncate">
                    {item.details}
                  </p>
                </div>

                {/* টাইম */}
                <div className="w-[100px] text-right">
                  <span className="text-[10px] md:text-xs text-stone-400">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}