"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Store, Users } from "lucide-react";

interface Retailer {
  _id: string;
  storeName: string;
  city?: string;
  createdAt: string;
  userId?: {
    fullName?: string;
    email?: string;
    status?: string;
  };
}

interface CustomerUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function LastActivity() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  const retailersQuery = useQuery({
    queryKey: ["dashboard-latest-retailers"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/retailer`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse<Retailer[]> | null;
      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "Unable to load retailers.");
      }
      return result.data.slice(0, 5);
    },
  });

  const customersQuery = useQuery({
    queryKey: ["dashboard-latest-customers"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(
        `${getApiBaseUrl()}/user?role=customer&limit=5&sortBy=createdAt&sortOrder=desc`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse<CustomerUser[]> | null;
      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "Unable to load consumers.");
      }
      return result.data;
    },
  });

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Latest Retailers */}
      <div className="w-full rounded-xl border border-[#EFE2C7] bg-[#2A1B10]/40 p-5 md:p-6">
        <div className="flex items-center justify-between border-b border-[#705929] pb-4">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-[#CBA24A]" />
            <h2 className="text-sm font-semibold tracking-wide text-[#F7E4B3] md:text-base">
              Latest Retailers
            </h2>
          </div>
          <Link
            href="/retailer-management"
            className="text-xs font-medium tracking-wide text-[#cca352] hover:underline"
          >
            View All
          </Link>
        </div>

        {retailersQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-stone-400">
            Loading retailers...
          </p>
        ) : retailersQuery.isError ? (
          <p className="py-8 text-center text-sm text-red-400">
            {retailersQuery.error.message}
          </p>
        ) : retailersQuery.data?.length ? (
          <div className="flex flex-col">
            {retailersQuery.data.map((retailer, index) => (
              <div
                key={retailer._id}
                className={`grid grid-cols-[1fr_auto] items-center gap-4 py-3.5 sm:grid-cols-[1fr_1fr_auto] ${
                  index !== retailersQuery.data.length - 1
                    ? "border-b border-[#705929]/50"
                    : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#F7E4B3]/90 md:text-[13px]">
                    {retailer.userId?.fullName || retailer.storeName}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-stone-500 md:text-xs">
                    {retailer.userId?.email || "No email"}
                  </p>
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-xs text-stone-400">
                    {retailer.storeName}
                  </p>
                  <p className="mt-0.5 text-[10px] text-stone-500">
                    {retailer.city || "—"} •{" "}
                    {new Date(retailer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs capitalize text-[#cca352]">
                    {retailer.userId?.status || "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-stone-400">
            No retailers found.
          </p>
        )}
      </div>

      {/* Latest Consumers (Customers) */}
      <div className="w-full rounded-xl border border-[#EFE2C7] bg-[#2A1B10]/40 p-5 md:p-6">
        <div className="flex items-center justify-between border-b border-[#705929] pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#CBA24A]" />
            <h2 className="text-sm font-semibold tracking-wide text-[#F7E4B3] md:text-base">
              Latest Consumers (App Users)
            </h2>
          </div>
          <Link
            href="/user-management?role=customer"
            className="text-xs font-medium tracking-wide text-[#cca352] hover:underline"
          >
            View All
          </Link>
        </div>

        {customersQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-stone-400">
            Loading consumers...
          </p>
        ) : customersQuery.isError ? (
          <p className="py-8 text-center text-sm text-red-400">
            {customersQuery.error.message}
          </p>
        ) : customersQuery.data?.length ? (
          <div className="flex flex-col">
            {customersQuery.data.map((customer, index) => (
              <div
                key={customer._id}
                className={`grid grid-cols-[1fr_auto] items-center gap-4 py-3.5 sm:grid-cols-[1fr_1fr_auto] ${
                  index !== customersQuery.data.length - 1
                    ? "border-b border-[#705929]/50"
                    : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#F7E4B3]/90 md:text-[13px]">
                    {customer.fullName || "Consumer"}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-stone-500 md:text-xs">
                    {customer.email || "—"}
                  </p>
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="text-xs text-stone-400">Consumer Account</p>
                  <p className="mt-0.5 text-[10px] text-stone-500">
                    Joined {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${
                      customer.status?.toLowerCase() === "active"
                        ? "bg-[#0D543F] text-[#23E7A5]"
                        : "bg-[#6B211D] text-[#FF5B55]"
                    }`}
                  >
                    {customer.status || "active"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-stone-400">
            No consumer accounts found.
          </p>
        )}
      </div>
    </div>
  );
}
