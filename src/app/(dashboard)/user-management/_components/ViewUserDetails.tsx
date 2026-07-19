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

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: "Retailer" | "Customer";
  business: string;
  lastLogin: string;
  status: "Active" | "Suspended";
}

interface ViewUserDetailsProps {
  open: boolean;
  user: ManagedUser | null;
  onOpenChange: (open: boolean) => void;
}

export function UserStatusBadge({ status }: { status: ManagedUser["status"] }) {
  return (
    <span
      className={`inline-flex min-w-[68px] justify-center rounded-full px-3 py-1 text-[10px] font-medium ${
        status === "Active"
          ? "bg-[#0D543F] text-[#23E7A5]"
          : "bg-[#6B211D] text-[#FF5B55]"
      }`}
    >
      {status}
    </span>
  );
}

export default function ViewUserDetails({ open, user, onOpenChange }: ViewUserDetailsProps) {
  if (!user) return null;

  const details = [
    ["Full Name", user.name],
    ["Email", user.email],
    ["Role", user.role],
    ["Business", user.business],
    ["Last Login", user.lastLogin],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-[5px]"
        className="w-[calc(100%-2rem)] max-w-[520px] gap-0 rounded-xl border border-[#CBA24A]/10 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,0.65)]"
      >
        <DialogHeader className="px-6 pb-5 pt-6">
          <DialogTitle className="pr-8 font-serif text-2xl font-semibold text-[#D6AA50]">
            User Details
          </DialogTitle>
          <DialogDescription className="sr-only">Account details for {user.name}</DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close user details"
            className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-lg rounded-tr-xl bg-[#D6AA50] text-[#4A2D1D] transition-colors hover:bg-[#E7BF69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7E4B3]"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        <dl className="space-y-4 px-6 pb-6">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="mb-1 text-[11px] font-semibold text-[#F7E4B3]">{label}</dt>
              <dd className="text-xs text-[#BFA98A]">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="mb-1.5 text-[11px] font-semibold text-[#F7E4B3]">Status</dt>
            <dd><UserStatusBadge status={user.status} /></dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
