"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Cigar } from "./MasterDatabase";

interface Props {
  cigar: Cigar | null;
  onOpenChange: (open: boolean) => void;
}

export default function ViewMasterDatabase({ cigar, onOpenChange }: Props) {
  const submittedByRetailer =
    cigar?.submittedByRetailer &&
    typeof cigar.submittedByRetailer !== "string"
      ? cigar.submittedByRetailer
      : undefined;
  const details = cigar
    ? [
        ["Brand", cigar.brand],
        ["Wrapper", cigar.wrapper],
        ["Strength", cigar.strength],
        ["Size", cigar.size],
        ["Smoking Time", cigar.smokingTime],
        ["Quantity", String(cigar.quantity ?? 0)],
        ["Price", Number.isFinite(cigar.price) ? `$${cigar.price.toFixed(2)}` : "—"],
        ["Minimum Stock", String(cigar.lowStockThreshold ?? 5)],
        ["Pairing Suggestions", cigar.pairingSuggestions?.length ? cigar.pairingSuggestions.join(", ") : "—"],
      ]
    : [];
  const status = cigar?.status?.toLowerCase() || "unknown";
  const statusStyle = status === "active"
    ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
    : status === "inactive"
      ? "border-red-500/25 bg-red-950/60 text-red-400"
      : "border-amber-500/25 bg-amber-950/60 text-amber-400";

  return (
    <Dialog open={Boolean(cigar)} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/70 backdrop-blur-sm" className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[650px] gap-4 overflow-y-auto rounded-2xl border border-[#CBA24A]/20 bg-[#4A2D1D] p-5 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]">
        <DialogHeader>
          <DialogTitle className="pr-8 font-serif text-xl font-normal text-[#F7E4B3]">Product Details</DialogTitle>
          <DialogDescription className="sr-only">Cigar product details</DialogDescription>
        </DialogHeader>
        <button type="button" aria-label="Close" onClick={() => onOpenChange(false)} className="absolute right-5 top-5 cursor-pointer text-[#A99D91] hover:text-white"><X className="h-5 w-5" /></button>

        <div className="grid grid-cols-[112px_1fr] items-center gap-4 rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-3">
          {cigar?.image ? (
            <div className="relative h-24 w-28 overflow-hidden rounded-lg border border-[#CBA24A]/25"><Image src={cigar.image} alt={cigar.name || "Cigar product"} fill unoptimized className="object-cover" /></div>
          ) : (
            <div className="flex h-24 w-28 items-center justify-center rounded-lg border border-dashed border-[#CBA24A]/25 text-xs text-[#8F8278]">No image</div>
          )}
          <div className="min-w-0"><h3 className="truncate font-serif text-xl text-[#F7E4B3]">{cigar?.name || "Unnamed Product"}</h3><p className="mt-1 truncate text-sm text-[#BFA98A]">{cigar?.brand || "—"}</p><span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-medium capitalize ${statusStyle}`}>{status}</span></div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-[#CBA24A]/15 p-4">
          {details.map(([label, value], index) => (
            <div key={label} className={index === details.length - 1 ? "col-span-2" : "min-w-0"}>
              <dt className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">{label}</dt>
              <dd className="truncate text-sm text-[#F7E4B3]" title={value || "—"}>{value || "—"}</dd>
            </div>
          ))}
        </dl>

        {submittedByRetailer && (
          <section className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
              Submitted By Retailer
            </h4>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ["Store Name", submittedByRetailer.storeName],
                [
                  "Location",
                  [submittedByRetailer.address, submittedByRetailer.city]
                    .filter(Boolean)
                    .join(", "),
                ],
                ["Phone", submittedByRetailer.phoneNumber],
                ["Store Slug", submittedByRetailer.storeSlug],
                ["Retailer Status", submittedByRetailer.status],
                ["Subscription Plan", submittedByRetailer.subscriptionPlan],
                [
                  "Subscription Status",
                  submittedByRetailer.subscriptionStatus,
                ],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">
                    {label}
                  </dt>
                  <dd
                    className="truncate text-sm capitalize text-[#F7E4B3]"
                    title={value || "—"}
                  >
                    {value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <DetailText label="Description" value={cigar?.description} />
      </DialogContent>
    </Dialog>
  );
}

function DetailText({ label, value }: { label: string; value?: string }) {
  return <div className="min-w-0 rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-3"><p className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">{label}</p><p className="line-clamp-3 text-xs leading-5 text-[#F7E4B3]" title={value || "—"}>{value || "—"}</p></div>;
}
