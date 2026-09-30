"use client";

import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Database,
  Store,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

interface OverviewData {
  totalRetelier: number;
  totalVerifiRetelier: number;
  pendingProduct: number;
  totalMasterDatabase: number;
  totalEarnings: number;
}

interface OverviewResponse {
  success: boolean;
  message?: string;
  data?: OverviewData;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function OverviewStates() {
  const { data: session, status } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  const overviewQuery = useQuery({
    queryKey: ["dashboard-overview"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(
        `${getApiBaseUrl()}/dashboard/admin/overview`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response.json().catch(() => null)) as OverviewResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to load dashboard overview.");
      }
      return result.data;
    },
  });

  const stats = [
    {
      title: "Total Retailers",
      value: overviewQuery.data?.totalRetelier,
      icon: Store,
    },
    {
      title: "Verified Retailers",
      value: overviewQuery.data?.totalVerifiRetelier,
      icon: BadgeCheck,
    },
    {
      title: "Pending Products",
      value: overviewQuery.data?.pendingProduct,
      icon: Clock3,
    },
    {
      title: "Master Database",
      value: overviewQuery.data?.totalMasterDatabase,
      icon: Database,
    },
    {
      title: "Total Earnings",
      value:
        overviewQuery.data?.totalEarnings === undefined
          ? undefined
          : `$${overviewQuery.data.totalEarnings.toLocaleString()}`,
      icon: CircleDollarSign,
    },
  ];

  const isLoading = status === "loading" || overviewQuery.isLoading;

  return (
    <div className="w-full">
      {overviewQuery.isError && (
        <p className="mb-3 text-sm text-red-400">{overviewQuery.error.message}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-[12px] border border-[#EFE2C7] bg-[#332211] p-5 transition-all hover:border-[#CBA24A]/80"
            >
              <div className="flex w-full items-start justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">
                  {stat.title}
                </p>
                <div className="rounded-lg border border-[#CBA24A]/20 bg-[#140d09]/40 p-1.5 text-[#CBA24A]/80">
                  <Icon className="h-5 w-5 stroke-[1.5]" />
                </div>
              </div>
              <h3 className="mt-4 font-serif text-3xl font-medium tracking-wide text-[#F7E4B3] md:text-4xl">
                {isLoading ? "..." : (stat.value ?? "—")}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
