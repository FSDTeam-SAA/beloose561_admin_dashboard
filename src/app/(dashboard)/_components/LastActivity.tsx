"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

interface Retailer {
  _id: string;
  storeName: string;
  city?: string;
  status?: string;
  createdAt: string;
  userId?: {
    fullName?: string;
    email?: string;
    status?: string;
  };
}

interface RetailerResponse {
  success: boolean;
  message?: string;
  data?: Retailer[];
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
      const result = (await response.json().catch(() => null)) as RetailerResponse | null;
      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "Unable to load retailers.");
      }
      return result.data.slice(0, 5);
    },
  });

  return (
    <div className="mt-10 w-full rounded-xl border border-[#EFE2C7] p-5 md:p-6">
      <div className="flex items-center justify-between border-b border-[#705929] pb-4">
        <h2 className="text-sm font-semibold tracking-wide text-[#F7E4B3] md:text-base">
          Latest Retailers
        </h2>
        <Link href="/retailer-management" className="text-xs font-medium tracking-wide text-[#cca352] hover:underline">
          View All
        </Link>
      </div>

      {retailersQuery.isLoading ? (
        <p className="py-8 text-center text-sm text-stone-400">Loading retailers...</p>
      ) : retailersQuery.isError ? (
        <p className="py-8 text-center text-sm text-red-400">{retailersQuery.error.message}</p>
      ) : retailersQuery.data?.length ? (
        <div className="flex flex-col">
          {retailersQuery.data.map((retailer, index) => (
            <div
              key={retailer._id}
              className={`grid grid-cols-[1fr_auto] items-center gap-4 py-4 sm:grid-cols-[1fr_1fr_auto] ${
                index !== retailersQuery.data.length - 1 ? "border-b border-[#705929]" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#F7E4B3]/90 md:text-[13px]">
                  {retailer.userId?.fullName || retailer.storeName}
                </p>
                <p className="mt-1 truncate text-[10px] text-stone-500 md:text-xs">
                  {retailer.userId?.email || "No email"}
                </p>
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs text-stone-400">{retailer.storeName}</p>
                <p className="mt-1 text-[10px] text-stone-500">
                  {retailer.city || "—"} • {new Date(retailer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-xs capitalize text-[#cca352] md:inline">
                  {retailer.status || retailer.userId?.status || "pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-stone-400">No retailers found.</p>
      )}
    </div>
  );
}
