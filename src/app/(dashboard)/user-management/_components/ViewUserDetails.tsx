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

export interface ManagedUser {
  _id: string;
  fullName: string;
  businessName?: string;
  email: string;
  role: string;
  verfied?: string;
  status: string;
  isSubscription?: boolean;
  subscription?: string;
  subscriptionExpiry?: string;
  profilePicture?: string;
  gender?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

interface UserResponse {
  success: boolean;
  message?: string;
  data?: ManagedUser;
}

interface ViewUserDetailsProps {
  open: boolean;
  userId: string | null;
  accessToken?: string;
  onOpenChange: (open: boolean) => void;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export function UserStatusBadge({ status }: { status?: string }) {
  const isActive = status?.toLowerCase() === "active";
  return (
    <span className={`inline-flex min-w-[68px] justify-center rounded-full px-3 py-1 text-[10px] font-medium capitalize ${
      isActive ? "bg-[#0D543F] text-[#23E7A5]" : "bg-[#6B211D] text-[#FF5B55]"
    }`}>
      {status || "unknown"}
    </span>
  );
}

export default function ViewUserDetails({ open, userId, accessToken, onOpenChange }: ViewUserDetailsProps) {
  const userQuery = useQuery({
    queryKey: ["user-details", userId],
    enabled: open && Boolean(userId),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/${userId}?id=${userId}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const result = (await response.json().catch(() => null)) as UserResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to load user details.");
      }
      return result.data;
    },
  });

  const user = userQuery.data;
  const details = user
    ? [
        ["Full Name", user.fullName],
        ["Email", user.email],
        ["Role", user.role],
        ["Business", user.businessName],
        ["Verification", user.verfied],
        ["Phone", user.phoneNumber],
        ["Gender", user.gender],
        ["Date of Birth", user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : undefined],
        ["Address", [user.address, user.city, user.country].filter(Boolean).join(", ")],
        ["Subscription", user.isSubscription ? "Active" : "Inactive"],
        ["Subscription Expiry", user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : undefined],
        ["Joined", new Date(user.createdAt).toLocaleString()],
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-[5px]"
        className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[600px] gap-0 overflow-y-auto rounded-xl border border-[#CBA24A]/10 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,0.65)]"
      >
        <DialogHeader className="px-6 pb-5 pt-6">
          <DialogTitle className="pr-8 font-serif text-2xl font-semibold text-[#D6AA50]">User Details</DialogTitle>
          <DialogDescription className="sr-only">Complete user account details</DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <button type="button" aria-label="Close user details" className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-lg rounded-tr-xl bg-[#D6AA50] text-[#4A2D1D] transition-colors hover:bg-[#E7BF69]">
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        {userQuery.isLoading ? (
          <p className="px-6 pb-12 pt-6 text-center text-sm text-[#BFA98A]">Loading user details...</p>
        ) : userQuery.isError ? (
          <p className="px-6 pb-12 pt-6 text-center text-sm text-red-300">{userQuery.error.message}</p>
        ) : user ? (
          <div className="px-6 pb-6">
            {user.profilePicture && (
              <div className="mb-6 flex justify-center">
                <Image src={user.profilePicture} alt={user.fullName} width={112} height={112} className="h-28 w-28 rounded-full border-2 border-[#D6AA50]/40 object-cover" />
              </div>
            )}
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-1 text-[11px] font-semibold text-[#F7E4B3]">{label}</dt>
                  <dd className="break-words text-xs capitalize text-[#BFA98A]">{value || "—"}</dd>
                </div>
              ))}
              <div>
                <dt className="mb-1.5 text-[11px] font-semibold text-[#F7E4B3]">Status</dt>
                <dd><UserStatusBadge status={user.status} /></dd>
              </div>
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
