"use client";

import React, { useState } from "react";
import { Search, Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import ViewRetailer, { type Retailer } from "./ViewRetailer";
import DeleteModal from "@/components/deleteModal/DeleteModal";

// ইমেজ অনুযায়ী ডামি ডাটা
const initialRetailers = [
  {
    id: 1,
    businessName: "Casa del Habano NYC",
    owner: "Marco Delgado",
    location: "New York, NY",
    created: "Mar 12, 2024",
    status: "Active",
  },
  {
    id: 2,
    businessName: "The Cigar House",
    owner: "James Whitfield",
    location: "Miami, FL Fuente",
    created: "Apr 3, 2024",
    status: "Active",
  },
  {
    id: 3,
    businessName: "Churchill's Fine Cigars",
    owner: "Rebecca Harmon",
    location: "Chicago, IL",
    created: "Jan 28, 2024",
    status: "Suspended",
  },
  {
    id: 4,
    businessName: "Havana Club Boston",
    owner: "Luis Espinosa",
    location: "Boston, MA",
    created: "May 15, 2024",
    status: "Active",
  },
  {
    id: 5,
    businessName: "The Smoke Lounge",
    owner: "David Chen",
    location: "San Francisco, CA",
    created: "Jun 1, 2024",
    status: "Active",
  },
  {
    id: 6,
    businessName: "Premium Leaf Co.",
    owner: "Angela Torres",
    location: "Dallas, TX",
    created: "Feb 20, 2024",
    status: "Active",
  },
  {
    id: 7,
    businessName: "Montecristo Room",
    owner: "Patrick Sullivan",
    location: "Las Vegas, NV",
    created: "Jun 30, 2024",
    status: "Inactive",
  },
];

export default function RetailerManagementList() {
  const [retailers, setRetailers] = useState<Retailer[]>(initialRetailers);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [retailerToDelete, setRetailerToDelete] = useState<Retailer | null>(null);
  const itemsPerPage = 5;

  // সার্চ লজিক (Business Name বা Owner দিয়ে ফিল্টার হবে)
  const filteredRetailers = retailers.filter(
    (retailer) =>
      retailer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRetailers = filteredRetailers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // অ্যাকশন হ্যান্ডলার (লগ করার জন্য)
  const handleView = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
  };

  const handleDelete = () => {
    if (!retailerToDelete) return;

    setRetailers((currentRetailers) =>
      currentRetailers.filter((retailer) => retailer.id !== retailerToDelete.id),
    );
    const remainingPages = Math.max(
      1,
      Math.ceil((filteredRetailers.length - 1) / itemsPerPage),
    );
    setCurrentPage((page) => Math.min(page, remainingPages));
    setRetailerToDelete(null);
  };

  return (
    <div className="w-full rounded-2xl flex flex-col gap-5">
      
      {/* ১. সার্চ বার সেকশন (টেবিলের উপরে বাম পাশে) */}
      <div className="flex items-center justify-between w-full">
        <div className="relative w-full max-w-[360px]">
          <Input
            type="text"
            placeholder="Search retailers, owners or locations..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[40px] w-full bg-[#1c120c]/90 border border-[#CBA24A]/30 focus:border-[#CBA24A]/80 text-[#F7E4B3] placeholder:text-stone-600 text-xs rounded-[8px] pl-10 pr-4 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
        </div>
      </div>

      {/* ২. টেবিল কন্টেইনার (রেস্পন্সিভ স্ক্রোলসহ) */}
      <div className="w-full overflow-x-auto rounded-xl border border-[#F7E4B3]/30">
        <table className="w-full min-w-[900px] border-collapse text-left">
          {/* টেবিল হেডার */}
          <thead>
            <tr className="border-b border-[#705929] bg-[#140d09]/40">
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Business Name</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Owner</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Location</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Created</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Status</th>
              <th className="py-4 px-6 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70 text-right">Actions</th>
            </tr>
          </thead>

          {/* টেবিল বডি */}
          <tbody className="divide-y divide-[#705929]">
            {paginatedRetailers.map((retailer) => (
              <tr 
                key={retailer.id} 
                className="hover:bg-[#231710]/30 transition-colors"
              >
                {/* Business Name */}
                <td className="py-4 px-6 text-xs font-semibold text-[#F7E4B3]">
                  {retailer.businessName}
                </td>

                {/* Owner */}
                <td className="py-4 px-6 text-xs text-stone-400">
                  {retailer.owner}
                </td>

                {/* Location */}
                <td className="py-4 px-6 text-xs text-stone-400">
                  {retailer.location}
                </td>

                {/* Created */}
                <td className="py-4 px-6 text-xs text-stone-500">
                  {retailer.created}
                </td>

                {/* Status */}
                <td className="py-4 px-6 text-xs">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider ${
                      retailer.status === "Active"
                        ? "bg-[#0f2e1e]/60 text-[#10b981] border border-[#10b981]/20"
                        : retailer.status === "Suspended"
                        ? "bg-[#3b1212]/60 text-[#ef4444] border border-[#ef4444]/20"
                        : "bg-[#232324]/60 text-stone-400 border border-stone-600/20"
                    }`}
                  >
                    {retailer.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-xs text-right">
                  <div className="inline-flex items-center gap-3">
                    {/* View Button */}
                    <button
                      onClick={() => handleView(retailer)}
                      className="text-stone-400 hover:text-[#cca352] transition-colors p-1"
                      title="View Details"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => setRetailerToDelete(retailer)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-1"
                      title="Delete Retailer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
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
        total={filteredRetailers.length}
        currentCount={paginatedRetailers.length}
        onPageChange={setCurrentPage}
      />

      <ViewRetailer
        open={selectedRetailer !== null}
        retailer={selectedRetailer}
        onOpenChange={(open) => {
          if (!open) setSelectedRetailer(null);
        }}
      />

      <DeleteModal
        open={retailerToDelete !== null}
        itemName={retailerToDelete?.businessName}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setRetailerToDelete(null);
        }}
      />

    </div>
  );
}
