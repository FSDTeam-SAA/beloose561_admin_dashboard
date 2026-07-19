"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Retailer {
  id: number;
  businessName: string;
  owner: string;
  location: string;
  created: string;
  status: string;
}

interface ViewRetailerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retailer: Retailer | null;
}

export default function ViewRetailer({
  open,
  onOpenChange,
  retailer,
}: ViewRetailerProps) {
  if (!retailer) return null;

  const details = [
    { label: "Business Name", value: retailer.businessName },
    { label: "Owner", value: retailer.owner },
    { label: "Location", value: retailer.location },
    { label: "Created", value: retailer.created },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/35 backdrop-blur-sm"
        className="w-[calc(100%-2rem)] max-w-[460px] gap-5 overflow-hidden rounded-lg border border-[#CBA24A]/25 bg-[#4A2D1D] p-6 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-semibold text-[#D6AA50]">
            Retailer Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Details for {retailer.businessName}
          </DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close retailer details"
            className="absolute right-0 top-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-bl-md bg-[#D6AA50] text-[#4A2D1D] transition-colors hover:bg-[#E7BF69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7E4B3]"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        <dl className="space-y-4">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="mb-1 text-[11px] font-medium text-[#D6AA50]">
                {detail.label}
              </dt>
              <dd className="text-sm text-[#F1DFC0]">{detail.value}</dd>
            </div>
          ))}

          <div>
            <dt className="mb-1 text-[11px] font-medium text-[#D6AA50]">
              Status
            </dt>
            <dd>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${
                  retailer.status === "Active"
                    ? "border-emerald-500/20 bg-emerald-950/60 text-emerald-400"
                    : retailer.status === "Suspended"
                      ? "border-red-500/20 bg-red-950/60 text-red-400"
                      : "border-stone-500/20 bg-stone-900/60 text-stone-400"
                }`}
              >
                {retailer.status}
              </span>
            </dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
