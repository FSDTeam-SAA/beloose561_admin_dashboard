"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";

export interface Cigar {
  _id: string;
  name: string;
  brand: string;
  productLine?: string;
  manufacturer?: string;
  country: string;
  wrapper: string;
  binder?: string;
  filler?: string;
  strength: string;
  size: string;
  ringGauge?: number;
  length?: string;
  flavorNotes?: string[];
  smokingTime?: string;
  image?: string;
  description?: string;
  whyYoullLikeThis?: string;
  priceRange?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

interface MasterDatabaseResponse {
  success: boolean;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data?: Cigar[];
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function MasterDatabase() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const cigarsQuery = useQuery({
    queryKey: ["master-database", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (searchTerm) params.set("searchTerm", searchTerm);

      const response = await fetch(`${getApiBaseUrl()}/master-database?${params}`);
      const result = (await response.json().catch(() => null)) as MasterDatabaseResponse | null;

      if (!response.ok || !result?.success || !Array.isArray(result.data) || !result.meta) {
        throw new Error(result?.message || "Unable to load master database.");
      }

      return { cigars: result.data, meta: result.meta };
    },
  });

  const cigars = cigarsQuery.data?.cigars ?? [];
  const total = cigarsQuery.data?.meta.total ?? 0;

  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl">
      <div className="flex w-full items-center justify-between">
        <div className="relative w-full max-w-[360px]">
          <Input
            type="search"
            placeholder="Search cigars, brands or countries..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-[40px] w-full rounded-[8px] border border-[#CBA24A]/30 bg-[#1c120c]/90 pl-10 pr-4 text-xs text-[#F7E4B3] placeholder:text-stone-600 transition-colors focus:border-[#CBA24A]/80 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-[#F7E4B3]/30">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#705929] bg-[#140d09]/40">
              {["Cigar Name", "Brand", "Country", "Wrapper", "Strength", "Size", "Price"].map(
                (heading) => (
                  <th key={heading} className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#705929]">
            {cigarsQuery.isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-stone-400">
                  Loading master database...
                </td>
              </tr>
            ) : cigarsQuery.isError ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-red-400">
                  {cigarsQuery.error.message}
                </td>
              </tr>
            ) : cigars.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-stone-400">
                  No cigars found.
                </td>
              </tr>
            ) : (
              cigars.map((cigar) => (
                <tr key={cigar._id} className="h-16 transition-colors hover:bg-[#231710]/30">
                  <td className="px-6 py-4 text-xs font-semibold text-[#F7E4B3]">{cigar.name || "—"}</td>
                  <td className="px-6 py-4 text-xs text-stone-400">{cigar.brand || "—"}</td>
                  <td className="px-6 py-4 text-xs text-stone-400">{cigar.country || "—"}</td>
                  <td className="px-6 py-4 text-xs text-stone-400">{cigar.wrapper || "—"}</td>
                  <td className="px-6 py-4 text-xs capitalize text-stone-500">{cigar.strength || "—"}</td>
                  <td className="px-6 py-4 text-xs text-stone-500">{cigar.size || "—"}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-[#cca352]">{cigar.priceRange || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        limit={itemsPerPage}
        total={total}
        currentCount={cigars.length}
        onPageChange={setCurrentPage}
        disabled={cigarsQuery.isFetching}
      />
    </div>
  );
}
