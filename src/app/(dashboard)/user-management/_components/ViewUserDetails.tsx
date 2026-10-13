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
  consumerProfile?: {
    experienceLevel?: string;
    preferredStrengths?: string[];
    preferredWrappers?: string[];
    preferredFlavors?: string[];
    preferredOrigins?: string[];
    preferredSmokingTimes?: string[];
    favoriteBrands?: string[];
    minBudget?: number;
    maxBudget?: number;
    onboardingCompleted?: boolean;
  };
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

  const isCustomer = user?.role?.toLowerCase() === "customer";
  const isRetailer = user?.role?.toLowerCase() === "retailer";
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const modalTitle = isCustomer
    ? "Consumer (Customer) Details"
    : isRetailer
      ? "Retailer Account Details"
      : isAdmin
        ? "Administrator Details"
        : "User Details";

  let details: [string, string | undefined][] = [];

  if (user) {
    if (isCustomer) {
      details = [
        ["Full Name", user.fullName],
        ["Email", user.email],
        ["Role", "Consumer (Mobile App / Customer)"],
        ["Phone Number", user.phoneNumber],
        ["Gender", user.gender],
        ["Date of Birth", user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : undefined],
        ["Location", [user.city, user.country].filter(Boolean).join(", ") || user.address],
        ["Account Created", new Date(user.createdAt).toLocaleDateString()],
      ];
    } else if (isRetailer) {
      details = [
        ["Contact Person", user.fullName],
        ["Email", user.email],
        ["Business Name", user.businessName],
        ["Role", "Retailer Partner"],
        ["Verification Status", user.verfied],
        ["Phone Number", user.phoneNumber],
        ["Subscription Status", user.isSubscription ? "Active" : "Inactive"],
        ["Subscription Plan", user.subscription],
        ["Subscription Expiry", user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : undefined],
        ["Store Address", [user.address, user.city, user.country].filter(Boolean).join(", ")],
        ["Registered Date", new Date(user.createdAt).toLocaleDateString()],
      ];
    } else if (isAdmin) {
      details = [
        ["Admin Name", user.fullName],
        ["Email", user.email],
        ["Role", "System Administrator"],
        ["Account Created", new Date(user.createdAt).toLocaleDateString()],
        ["Last Updated", user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : undefined],
      ];
    } else {
      details = [
        ["Full Name", user.fullName],
        ["Email", user.email],
        ["Role", user.role],
        ["Business Name", user.businessName],
        ["Phone Number", user.phoneNumber],
        ["Location", [user.city, user.country].filter(Boolean).join(", ")],
        ["Joined Date", new Date(user.createdAt).toLocaleDateString()],
      ];
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-[5px]"
        className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[620px] gap-0 overflow-y-auto rounded-xl border border-[#CBA24A]/10 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,0.65)]"
      >
        <DialogHeader className="px-6 pb-5 pt-6">
          <DialogTitle className="pr-8 font-serif text-2xl font-semibold text-[#D6AA50]">{modalTitle}</DialogTitle>
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

            {user.consumerProfile && (
              <div className="mt-6 rounded-lg border border-[#CBA24A]/25 bg-[#2B170B]/70 p-4">
                <h4 className="font-serif text-sm font-semibold text-[#D6AA50]">
                  Consumer Taste Profile
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <span className="text-[10px] text-[#A89070]">Experience Level:</span>
                    <p className="font-medium capitalize text-[#F7E4B3]">
                      {user.consumerProfile.experienceLevel || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A89070]">Onboarding:</span>
                    <p className="font-medium text-[#F7E4B3]">
                      {user.consumerProfile.onboardingCompleted ? "Completed" : "In Progress"}
                    </p>
                  </div>
                  {Boolean(user.consumerProfile.preferredStrengths?.length) && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-[#A89070]">Preferred Strengths:</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {user.consumerProfile.preferredStrengths?.map((item) => (
                          <span key={item} className="rounded bg-[#CBA24A]/20 px-2 py-0.5 text-[10px] capitalize text-[#F7E4B3]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {Boolean(user.consumerProfile.preferredFlavors?.length) && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-[#A89070]">Preferred Flavors:</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {user.consumerProfile.preferredFlavors?.map((item) => (
                          <span key={item} className="rounded bg-[#CBA24A]/20 px-2 py-0.5 text-[10px] capitalize text-[#F7E4B3]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {Boolean(user.consumerProfile.favoriteBrands?.length) && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-[#A89070]">Favorite Brands:</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {user.consumerProfile.favoriteBrands?.map((item) => (
                          <span key={item} className="rounded bg-[#4A301D] px-2 py-0.5 text-[10px] text-[#D6AA50]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(user.consumerProfile.minBudget !== undefined || user.consumerProfile.maxBudget !== undefined) && (
                    <div>
                      <span className="text-[10px] text-[#A89070]">Budget Range:</span>
                      <p className="font-medium text-[#F7E4B3]">
                        ${user.consumerProfile.minBudget ?? 0} - ${user.consumerProfile.maxBudget ?? "No limit"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
