"use client";

import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface Subscription {
  id: number;
  name: string;
  email: string;
  role: "Retailer" | "Customer";
  business: string;
  plan: "Monthly" | "Yearly";
  price: string;
  expiryDate: string;
  status: "Active" | "Expired";
}

interface DetailsSubscriptionModalProps {
  open: boolean;
  subscription: Subscription | null;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionStatusBadge({ status }: { status: Subscription["status"] }) {
  return (
    <span className={`inline-flex min-w-[68px] justify-center rounded-full px-3 py-1 text-[11px] font-medium ${status === "Active" ? "border border-[#087454]/70 bg-[#0D543F] text-[#20E5A3]" : "border border-[#9B251F]/70 bg-[#6B211D] text-[#FF5B55]"}`}>
      {status}
    </span>
  );
}

export default function DetaislSubscriptionModal({ open, subscription, onOpenChange }: DetailsSubscriptionModalProps) {
  if (!subscription) return null;

  const details = [
    ["Full Name", subscription.name],
    ["Role", subscription.role],
    ["Business", subscription.business],
    ["Plan", subscription.plan],
    ["Price", subscription.price],
    ["Expiry Date", subscription.expiryDate],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/70 backdrop-blur-[5px]" className="max-h-[92vh] w-[calc(100%-2rem)] max-w-[555px] gap-0 overflow-y-auto rounded-xl border border-[#CBA24A]/10 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,0.65)]">
        <DialogHeader className="px-5 pb-6 pt-6 sm:px-6">
          <DialogTitle className="pr-8 font-serif text-[28px] font-semibold text-[#D6AA50]">Subscription Details</DialogTitle>
          <DialogDescription className="sr-only">Subscription details for {subscription.name}</DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <button type="button" aria-label="Close subscription details" className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-xl rounded-tr-xl bg-[#D6AA50] text-[#4A2D1D] transition-colors hover:bg-[#E7BF69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7E4B3]">
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <dl className="space-y-4 px-5 pb-6 sm:px-6">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="mb-1.5 text-sm font-semibold text-[#F7E4B3]">{label}</dt>
              <dd className="text-sm text-[#BFA98A]">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="mb-1.5 text-sm font-semibold text-[#F7E4B3]">Status</dt>
            <dd><SubscriptionStatusBadge status={subscription.status} /></dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
