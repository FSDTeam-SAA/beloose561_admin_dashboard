"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";

export interface Cigar {
  id: number;
  cigarName: string;
  brand: string;
  country: string;
  wrapper: string;
  strength: string;
  size: string;
  price: string;
}

// ইমেজ অনুযায়ী মাস্টার ডাটাবেজ ডামি ডাটা
const initialCigars: Cigar[] = [
  {
    id: 1,
    cigarName: "Opus X Perfecxion X",
    brand: "Arturo Fuente",
    country: "New York, NY",
    wrapper: "Dominican Republic",
    strength: "Medium-Full",
    size: "Medium-Full",
    price: "$38.00",
  },
  {
    id: 2,
    cigarName: "1964 Anniversary Series",
    brand: "Padron",
    country: "Miami, FL Fuente",
    wrapper: "Nicaragua",
    strength: "Medium",
    size: "Medium",
    price: "$26.50",
  },
  {
    id: 3,
    cigarName: "Liga Privada No. 9",
    brand: "Drew Estate",
    country: "Chicago, IL",
    wrapper: "Nicaragua",
    strength: "Medium-Full",
    size: "Medium-Full",
    price: "$18.00",
  },
  {
    id: 4,
    cigarName: "Behike BHK 52",
    brand: "Cohiba",
    country: "Boston, MA",
    wrapper: "Cuba",
    strength: "Full",
    size: "Full",
    price: "$85.00",
  },
  {
    id: 5,
    cigarName: "Anniversario No. 3",
    brand: "Davidoff",
    country: "San Francisco, CA",
    wrapper: "Dominican Republic",
    strength: "Full",
    size: "Full",
    price: "$42.00",
  },
];

export default function MasterDatabase() {
  const [cigars] = useState<Cigar[]>(initialCigars);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // সার্চ লজিক (Cigar Name, Brand, Country, বা Wrapper দিয়ে ফিল্টার হবে)
  const filteredCigars = cigars.filter(
    (cigar) =>
      cigar.cigarName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cigar.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cigar.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cigar.wrapper.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // পেজিনেশন স্লাইস
  const paginatedCigars = filteredCigars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="w-full rounded-2xl flex flex-col gap-5">
      
      {/* ১. সার্চ বার সেকশন */}
      <div className="flex items-center justify-between w-full">
        <div className="relative w-full max-w-[360px]">
          <Input
            type="text"
            placeholder="Search cigars, brands or countries..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // সার্চ করার সাথে সাথে প্রথম পেজে রিডাইরেক্ট করবে
            }}
            className="h-[40px] w-full bg-[#1c120c]/90 border border-[#CBA24A]/30 focus:border-[#CBA24A]/80 text-[#F7E4B3] placeholder:text-stone-600 text-xs rounded-[8px] pl-10 pr-4 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
        </div>
      </div>

      {/* ২. টেবিল কন্টেইনার (৭টি কলামের জন্য min-w-[1000px] দেওয়া হয়েছে) */}
      <div className="w-full overflow-x-auto rounded-xl border border-[#F7E4B3]/30">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          {/* টেবিল হেডার */}
          <thead>
            <tr className="border-b border-[#705929] bg-[#140d09]/40">
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Cigar Name</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Brand</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Country</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Wrapper</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Strength</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Size</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Price</th>
            </tr>
          </thead>

          {/* টেবিল বডি */}
          <tbody className="divide-y divide-[#705929]">
            {paginatedCigars.map((cigar) => (
              <tr 
                key={cigar.id} 
                className="h-16 hover:bg-[#231710]/30 transition-colors"
              >
                {/* Cigar Name */}
                <td className="py-4 px-6 text-xs font-semibold text-[#F7E4B3]">
                  {cigar.cigarName}
                </td>

                {/* Brand */}
                <td className="py-4 px-6 text-xs text-stone-400">
                  {cigar.brand}
                </td>

                {/* Country */}
                <td className="py-4 px-6 text-xs text-stone-400">
                  {cigar.country}
                </td>

                {/* Wrapper */}
                <td className="py-4 px-6 text-xs text-stone-400">
                  {cigar.wrapper}
                </td>

                {/* Strength */}
                <td className="py-4 px-6 text-xs text-stone-500">
                  {cigar.strength}
                </td>

                {/* Size */}
                <td className="py-4 px-6 text-xs text-stone-500">
                  {cigar.size}
                </td>

                {/* Price (Premium Gold Color) */}
                <td className="py-4 px-6 text-xs font-semibold text-[#cca352]">
                  {cigar.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ৩. পেজিনেশন সেকশন */}
      <Pagination
        page={currentPage}
        limit={itemsPerPage}
        total={filteredCigars.length}
        currentCount={paginatedCigars.length}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}
