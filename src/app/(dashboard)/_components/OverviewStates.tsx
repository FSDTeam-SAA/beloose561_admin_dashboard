"use client";

import Link from "next/link";
import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Database,
  Store,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

interface OverviewData {
  totalRetelier: number;
  totalVerifiRetelier: number;
  totalCustomers?: number;
  activeCustomers?: number;
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
      href: "/retailer-management",
      icon: Store,
    },
    {
      title: "Verified Retailers",
      value: overviewQuery.data?.totalVerifiRetelier,
      href: "/retailer-management",
      icon: BadgeCheck,
    },
    {
      title: "Total Consumers",
      value: overviewQuery.data?.totalCustomers ?? 0,
      subValue:
        overviewQuery.data?.activeCustomers !== undefined
          ? `${overviewQuery.data.activeCustomers} active`
          : undefined,
      href: "/user-management?role=customer",
      icon: Users,
    },
    {
      title: "Pending Products",
      value: overviewQuery.data?.pendingProduct,
      href: "/product-approval",
      icon: Clock3,
    },
    {
      title: "Master Database",
      value: overviewQuery.data?.totalMasterDatabase,
      href: "/master-database",
      icon: Database,
    },
    {
      title: "Total Earnings",
      value:
        overviewQuery.data?.totalEarnings === undefined
          ? undefined
          : `$${overviewQuery.data.totalEarnings.toLocaleString()}`,
      href: "/payment-history",
      icon: CircleDollarSign,
    },
  ];

  const isLoading = status === "loading" || overviewQuery.isLoading;

  return (
    <div className="w-full">
      {overviewQuery.isError && (
        <p className="mb-3 text-sm text-red-400">{overviewQuery.error.message}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-[12px] border border-[#EFE2C7] bg-[#332211] p-4 transition-all hover:border-[#CBA24A] hover:bg-[#3D2915]"
            >
              <div className="flex w-full items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70 group-hover:text-[#F7E4B3]">
                    {stat.title}
                  </p>
                  {stat.subValue && (
                    <span className="mt-0.5 inline-block text-[10px] font-medium text-emerald-400">
                      {stat.subValue}
                    </span>
                  )}
                </div>
                <div className="rounded-lg border border-[#CBA24A]/20 bg-[#140d09]/40 p-1.5 text-[#CBA24A]/80 group-hover:border-[#CBA24A]/50 group-hover:text-[#F7E4B3]">
                  <Icon className="h-4 w-4 stroke-[1.5]" />
                </div>
              </div>
              <h3 className="mt-3 font-serif text-2xl font-medium tracking-wide text-[#F7E4B3] md:text-3xl">
                {isLoading ? "..." : (stat.value ?? "—")}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
