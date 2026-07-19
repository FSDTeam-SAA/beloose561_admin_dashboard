"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RetailerUser {
  _id: string;
  fullName?: string;
  businessName?: string;
  email?: string;
  role?: string;
  verfied?: string;
  status?: string;
  isSubscription?: boolean;
  subscriptionExpiry?: string;
}

export interface Retailer {
  _id: string;
  userId?: RetailerUser;
  storeName: string;
  address?: string;
  phoneNumber?: string;
  city?: string;
  description?: string;
  storeSlug?: string;
  status?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  createdAt: string;
  updatedAt?: string;
  qrCodeUrl?: string;
  logo?: string;
}

interface RetailerResponse {
  success: boolean;
  message?: string;
  data?: Retailer;
}

interface ViewRetailerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retailerId: string | null;
  accessToken?: string;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function ViewRetailer({
  open,
  onOpenChange,
  retailerId,
  accessToken,
}: ViewRetailerProps) {
  const retailerQuery = useQuery({
    queryKey: ["retailer-details", retailerId],
    enabled: open && Boolean(retailerId && accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/retailer/${retailerId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response.json().catch(() => null)) as RetailerResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to load retailer details.");
      }
      return result.data;
    },
  });

  const retailer = retailerQuery.data;
  const details = retailer
    ? [
        ["Owner", retailer.userId?.fullName],
        ["Email", retailer.userId?.email],
        ["Business Name", retailer.userId?.businessName],
        ["Store Name", retailer.storeName],
        ["Phone", retailer.phoneNumber],
        ["Address", [retailer.address, retailer.city].filter(Boolean).join(", ")],
        ["Store Slug", retailer.storeSlug],
        ["Retailer Status", retailer.status],
        ["User Status", retailer.userId?.status],
        ["Verification", retailer.userId?.verfied],
        ["Subscription Plan", retailer.subscriptionPlan],
        ["Subscription Status", retailer.subscriptionStatus],
        ["Subscription Expiry", retailer.userId?.subscriptionExpiry ? new Date(retailer.userId.subscriptionExpiry).toLocaleDateString() : undefined],
        ["Created", new Date(retailer.createdAt).toLocaleString()],
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/35 backdrop-blur-sm"
        className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[680px] gap-5 overflow-y-auto rounded-lg border border-[#CBA24A]/25 bg-[#4A2D1D] p-6 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-semibold text-[#D6AA50]">Retailer Details</DialogTitle>
          <DialogDescription className="sr-only">Complete retailer information</DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <button type="button" aria-label="Close retailer details" className="absolute right-0 top-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-bl-md bg-[#D6AA50] text-[#4A2D1D] transition-colors hover:bg-[#E7BF69]">
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        {retailerQuery.isLoading ? (
          <p className="py-12 text-center text-sm text-[#BFA98A]">Loading retailer details...</p>
        ) : retailerQuery.isError ? (
          <p className="py-12 text-center text-sm text-red-300">{retailerQuery.error.message}</p>
        ) : retailer ? (
          <>
            {(retailer.logo || retailer.qrCodeUrl) && (
              <div className="flex flex-wrap justify-center gap-5">
                {retailer.logo && <Image src={retailer.logo} alt={`${retailer.storeName} logo`} width={144} height={144} className="h-36 w-36 rounded-lg border border-[#CBA24A]/25 object-cover" />}
                {retailer.qrCodeUrl && <Image src={retailer.qrCodeUrl} alt={`${retailer.storeName} QR code`} width={144} height={144} className="h-36 w-36 rounded-lg border border-[#CBA24A]/25 bg-white object-contain p-2" />}
              </div>
            )}
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-1 text-[11px] font-medium text-[#D6AA50]">{label}</dt>
                  <dd className="break-words text-sm capitalize text-[#F1DFC0]">{value || "—"}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="mb-1 text-[11px] font-medium text-[#D6AA50]">Description</dt>
                <dd className="text-sm leading-6 text-[#F1DFC0]">{retailer.description || "—"}</dd>
              </div>
            </dl>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
