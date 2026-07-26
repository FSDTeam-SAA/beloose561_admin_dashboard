"use client";

import { useEffect, useState } from "react";
import { Check, Eye, Search, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import ViewProduct, { StatusBadge, type InventoryItem } from "./ViewProduct";

interface InventoryListResponse {
  success: boolean;
  message?: string;
  meta?: { page: number; limit: number; total: number };
  data?: InventoryItem[];
}
interface ActionResponse {
  success: boolean;
  message?: string;
  errorSources?: { path?: string; message?: string }[];
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function ProductApprovalList() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const inventoryQuery = useQuery({
    queryKey: ["inventory", currentPage, itemsPerPage, searchTerm],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (searchTerm) params.set("searchTerm", searchTerm);
      const response = await fetch(`${getApiBaseUrl()}/inventory?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as InventoryListResponse | null;
      if (
        !response.ok ||
        !result?.success ||
        !Array.isArray(result.data) ||
        !result.meta
      )
        throw new Error(result?.message || "Unable to load inventory.");
      return { products: result.data, meta: result.meta };
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ product, status }: { product: InventoryItem; status: "active" | "inactive" }) => {
      if (!accessToken) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(
        `${getApiBaseUrl()}/inventory/${product._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as ActionResponse | null;
      if (!response.ok || !result?.success)
        throw new Error(
          result?.errorSources
            ?.map((source) => source.message)
            .filter(Boolean)
            .join(", ") ||
            result?.message ||
            `Unable to ${status === "active" ? "approve" : "reject"} product.`,
        );
      return { result, product, status };
    },
    onSuccess: async ({ result, product, status }) => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["inventory-details", product._id] });
      toast.success(result.message || `Product ${status === "active" ? "approved" : "rejected"} successfully.`);
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to update product status.",
      ),
  });

  const products = inventoryQuery.data?.products ?? [];
  const total = inventoryQuery.data?.meta.total ?? 0;
  const isLoading = sessionStatus === "loading" || inventoryQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl">
      <div className="relative w-full max-w-[360px]">
        <Input
          type="search"
          placeholder="Search products, brands or status..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="h-10 w-full rounded-[8px] border border-[#CBA24A]/30 bg-[#1c120c]/90 pl-10 pr-4 text-xs text-[#F7E4B3] placeholder:text-stone-600 focus:border-[#CBA24A]/80 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
      </div>
      <div className="w-full overflow-x-auto rounded-xl border border-[#F7E4B3]/30">
        <table className="w-full min-w-[950px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#705929] bg-[#140d09]/40">
              {[
                "Product",
                "Brand",
                "Quantity",
                "Price",
                "Submitted",
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
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-stone-400"
                >
                  Loading inventory...
                </td>
              </tr>
            ) : inventoryQuery.isError ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-red-400"
                >
                  {inventoryQuery.error.message}
                </td>
              </tr>
            ) : !accessToken ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-red-400"
                >
                  You are not authorized.
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-stone-400"
                >
                  No inventory found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  className="h-16 transition-colors hover:bg-[#231710]/30"
                >
                  <td className="px-6 py-4 text-xs font-semibold text-[#F7E4B3]">
                    {product.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-400">
                    {product.brand || "—"}
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-400">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-[#cca352]">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        title="View Product"
                        className="cursor-pointer p-1 text-stone-400 hover:text-[#CCA352]"
                      >
                        <Eye className="h-[18px] w-[18px]" />
                      </button>
                      {product.status?.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_") === "under_review" ? (
                        <>
                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ product, status: "active" })}
                            title="Approve Product"
                            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-950/50 px-2.5 text-[10px] font-semibold text-emerald-400 transition hover:bg-emerald-900/60 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ product, status: "inactive" })}
                            title="Reject Product"
                            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-red-500/25 bg-red-950/50 px-2.5 text-[10px] font-semibold text-red-400 transition hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
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
        currentCount={products.length}
        onPageChange={setCurrentPage}
        disabled={inventoryQuery.isFetching}
      />
      <ViewProduct
        product={selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      />
    </div>
  );
}
