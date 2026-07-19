"use client";

import { useEffect, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import ViewRetailer, { type Retailer } from "./ViewRetailer";

interface RetailerListResponse {
  success: boolean;
  message?: string;
  meta?: { page: number; limit: number; total: number };
  data?: Retailer[];
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function RetailerManagementList() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRetailerId, setSelectedRetailerId] = useState<string | null>(null);
  const [retailerToDelete, setRetailerToDelete] = useState<Retailer | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const retailersQuery = useQuery({
    queryKey: ["retailers", currentPage, itemsPerPage, searchTerm],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (searchTerm) params.set("searchTerm", searchTerm);

      const response = await fetch(`${getApiBaseUrl()}/retailer?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response.json().catch(() => null)) as RetailerListResponse | null;
      if (!response.ok || !result?.success || !Array.isArray(result.data) || !result.meta) {
        throw new Error(result?.message || "Unable to load retailers.");
      }
      return { retailers: result.data, meta: result.meta };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (retailer: Retailer) => {
      const response = await fetch(`${getApiBaseUrl()}/retailer/${retailer._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response.json().catch(() => null)) as DeleteResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to delete retailer.");
      }
      return result;
    },
    onSuccess: async (result) => {
      const deletingLastItem = retailers.length === 1 && currentPage > 1;
      setRetailerToDelete(null);
      if (deletingLastItem) setCurrentPage((page) => page - 1);
      await queryClient.invalidateQueries({ queryKey: ["retailers"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-latest-retailers"] });
      toast.success(result.message || "Retailer deleted successfully.");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Unable to delete retailer."),
  });

  const retailers = retailersQuery.data?.retailers ?? [];
  const total = retailersQuery.data?.meta.total ?? 0;
  const isLoading = sessionStatus === "loading" || retailersQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl">
      <div className="flex w-full items-center justify-between">
        <div className="relative w-full max-w-[360px]">
          <Input
            type="search"
            placeholder="Search store, city, address or phone..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-[40px] w-full rounded-[8px] border border-[#CBA24A]/30 bg-[#1c120c]/90 pl-10 pr-4 text-xs text-[#F7E4B3] placeholder:text-stone-600 focus:border-[#CBA24A]/80 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-[#F7E4B3]/30">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#705929] bg-[#140d09]/40">
              {[
                "Business Name",
                "Owner",
                "Location",
                "Created",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70 ${heading === "Actions" ? "text-right" : ""}`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#705929]">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-stone-400">Loading retailers...</td></tr>
            ) : retailersQuery.isError ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-red-400">{retailersQuery.error.message}</td></tr>
            ) : !accessToken ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-red-400">You are not authorized.</td></tr>
            ) : retailers.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-stone-400">No retailers found.</td></tr>
            ) : (
              retailers.map((retailer) => {
                const status = retailer.status || retailer.userId?.status || "pending";
                return (
                  <tr key={retailer._id} className="transition-colors hover:bg-[#231710]/30">
                    <td className="px-6 py-4 text-xs font-semibold text-[#F7E4B3]">{retailer.storeName || "—"}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-stone-400">{retailer.userId?.fullName || "—"}</p>
                      <p className="mt-1 text-[10px] text-stone-500">{retailer.userId?.email || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-400">{[retailer.address, retailer.city].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-6 py-4 text-xs text-stone-500">{new Date(retailer.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold capitalize tracking-wider ${
                        status === "approved" || status === "active"
                          ? "border-emerald-500/20 bg-emerald-950/60 text-emerald-400"
                          : status === "rejected" || status === "suspended"
                            ? "border-red-500/20 bg-red-950/60 text-red-400"
                            : "border-amber-500/20 bg-amber-950/60 text-amber-400"
                      }`}>{status}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs">
                      <div className="inline-flex items-center gap-3">
                        <button type="button" onClick={() => setSelectedRetailerId(retailer._id)} className="cursor-pointer p-1 text-stone-400 transition-colors hover:text-[#cca352]" title="View Details" aria-label={`View ${retailer.storeName}`}>
                          <Eye className="h-[18px] w-[18px]" />
                        </button>
                        <button type="button" onClick={() => setRetailerToDelete(retailer)} className="cursor-pointer p-1 text-stone-400 transition-colors hover:text-red-500" title="Delete Retailer" aria-label={`Delete ${retailer.storeName}`}>
                          <Trash2 className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        limit={itemsPerPage}
        total={total}
        currentCount={retailers.length}
        onPageChange={setCurrentPage}
        disabled={retailersQuery.isFetching}
      />

      <ViewRetailer
        open={selectedRetailerId !== null}
        retailerId={selectedRetailerId}
        accessToken={accessToken}
        onOpenChange={(open) => { if (!open) setSelectedRetailerId(null); }}
      />

      <DeleteModal
        open={retailerToDelete !== null}
        itemName={retailerToDelete?.storeName}
        disabled={deleteMutation.isPending}
        onConfirm={() => { if (retailerToDelete) deleteMutation.mutate(retailerToDelete); }}
        onOpenChange={(open) => { if (!open && !deleteMutation.isPending) setRetailerToDelete(null); }}
      />
    </div>
  );
}
