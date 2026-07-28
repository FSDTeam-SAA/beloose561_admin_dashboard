"use client";

import { Building2, Package, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Cigar } from "./MasterDatabase";

interface Props {
  cigar: Cigar | null;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

export default function ViewMasterDatabase({ cigar, onOpenChange }: Props) {
  const retailer =
    cigar?.submittedByRetailer &&
    typeof cigar.submittedByRetailer !== "string"
      ? cigar.submittedByRetailer
      : null;
  const status = cigar?.status?.toLowerCase() || "active";
  const statusStyle =
    status === "active"
      ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
      : status === "inactive" || status === "out_of_stock"
        ? "border-red-500/25 bg-red-950/60 text-red-400"
        : "border-amber-500/25 bg-amber-950/60 text-amber-400";

  const productDetails: Array<[string, string | undefined]> = cigar
    ? [
        ["Product Name", cigar.name],
        ["Brand", cigar.brand],
        ["Manufacturer", cigar.manufacturer],
        ["Country", cigar.country],
        [
          "Price",
          typeof cigar.price === "number"
            ? `$${cigar.price.toFixed(2)}`
            : "—",
        ],
        ["Created At", formatDate(cigar.createdAt)],
        ["Updated At", formatDate(cigar.updatedAt)],
      ]
    : [];

  const retailerDetails = retailer
    ? ([
        ["Store Name", retailer.storeName],
        [
          "Location",
          [retailer.address, retailer.city].filter(Boolean).join(", "),
        ],
        ["Phone Number", retailer.phoneNumber],
        ["Store Slug", retailer.storeSlug],
        ["Status", retailer.status],
        ["Subscription Plan", retailer.subscriptionPlan],
        ["Subscription Status", retailer.subscriptionStatus],
      ] satisfies Array<[string, string | undefined]>).filter(([, value]) =>
        Boolean(value),
      )
    : [];

  return (
    <Dialog open={Boolean(cigar)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[650px] gap-4 overflow-y-auto rounded-2xl border border-[#CBA24A]/20 bg-[#4A2D1D] p-5 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]"
      >
        <DialogHeader>
          <DialogTitle className="pr-8 font-serif text-xl font-normal text-[#F7E4B3]">
            Product Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Master database product details
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 cursor-pointer text-[#A99D91] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#CBA24A]/25 bg-[#342315]">
            <Package className="h-7 w-7 text-[#D6AA50]" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-serif text-xl text-[#F7E4B3]">
              {cigar?.name || "Unnamed Product"}
            </h3>
            <p className="mt-1 truncate text-sm text-[#BFA98A]">
              {cigar?.brand || "—"}
            </p>
            <span
              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[10px] font-medium capitalize ${statusStyle}`}
            >
              {status.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        <section className="rounded-xl border border-[#CBA24A]/15 p-4">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
            Product Information
          </h4>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {productDetails.map(([label, value]) => (
              <Detail key={label} label={label} value={value} />
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-4">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">
            Description
          </p>
          <p className="whitespace-pre-wrap text-sm leading-6 text-[#F7E4B3]">
            {cigar?.description || "—"}
          </p>
        </section>

        {retailer && (
          <section className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-4">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
              <Building2 className="h-4 w-4" />
              Submitted By Retailer
            </h4>
            {retailerDetails.length ? (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {retailerDetails.map(([label, value]) => (
                  <Detail
                    key={label}
                    label={label}
                    value={value}
                    capitalize={
                      label === "Status" ||
                      label === "Subscription Plan" ||
                      label === "Subscription Status"
                    }
                  />
                ))}
              </dl>
            ) : (
              <p className="text-sm text-[#A99D91]">
                Retailer information is not available.
              </p>
            )}
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  capitalize,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">
        {label}
      </dt>
      <dd
        className={`break-words text-sm text-[#F7E4B3] ${capitalize ? "capitalize" : ""}`}
        title={value || "—"}
      >
        {value?.replaceAll("_", " ") || "—"}
      </dd>
    </div>
  );
}
