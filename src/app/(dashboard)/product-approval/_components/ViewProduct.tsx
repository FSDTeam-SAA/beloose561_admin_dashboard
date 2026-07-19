"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface InventoryItem {
  _id: string;
  userId: string;
  retailerId: string;
  name?: string;
  brand?: string;
  strength?: string;
  wrapper?: string;
  size?: string;
  image?: string;
  description?: string;
  humidorId: string;
  shelfName: string;
  quantity: number;
  price: number;
  isStaffPick?: boolean;
  staffPickNote?: string;
  staffPickBy?: string;
  isNewArrival?: boolean;
  arrivalDate?: string;
  newArrivalNote?: string;
  isDailyFeatured?: boolean;
  featuredNote?: string;
  featuredPrice?: number;
  status?: string;
  lowStockThreshold?: number;
  totalSearches?: number;
  totalViews?: number;
  createdAt: string;
  updatedAt?: string;
}

interface InventoryResponse { success: boolean; message?: string; data?: InventoryItem }
interface ViewProductProps {
  open: boolean;
  productId: string | null;
  accessToken?: string;
  onOpenChange: (open: boolean) => void;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toLowerCase() || "unknown";
  const style = normalized === "active" || normalized === "approved"
    ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
    : normalized === "rejected"
      ? "border-red-500/25 bg-red-950/60 text-red-400"
      : "border-amber-600/30 bg-amber-950/60 text-amber-400";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold capitalize ${style}`}>{normalized.replaceAll("_", " ")}</span>;
}

export default function ViewProduct({ open, productId, accessToken, onOpenChange }: ViewProductProps) {
  const queryClient = useQueryClient();
  const productQuery = useQuery({
    queryKey: ["inventory-details", productId],
    enabled: open && Boolean(productId && accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/inventory/${productId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const result = (await response.json().catch(() => null)) as InventoryResponse | null;
      if (!response.ok || !result?.success || !result.data) throw new Error(result?.message || "Unable to load product.");
      return result.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: "active" | "inactive") => {
      const response = await fetch(`${getApiBaseUrl()}/inventory/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json().catch(() => null)) as InventoryResponse | null;
      if (!response.ok || !result?.success) throw new Error(result?.message || "Unable to update status.");
      return result;
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Inventory status updated.");
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["inventory-details", productId] });
      onOpenChange(false);
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Unable to update status."),
  });

  const product = productQuery.data;
  const details = product ? [
    ["Product Name", product.name], ["Brand", product.brand], ["Strength", product.strength],
    ["Wrapper", product.wrapper], ["Size", product.size], ["Shelf", product.shelfName],
    ["Quantity", String(product.quantity)], ["Price", `$${product.price.toLocaleString()}`],
    ["Low Stock Threshold", String(product.lowStockThreshold ?? "—")], ["Staff Pick", product.isStaffPick ? "Yes" : "No"],
    ["New Arrival", product.isNewArrival ? "Yes" : "No"], ["Daily Featured", product.isDailyFeatured ? "Yes" : "No"],
    ["Created", new Date(product.createdAt).toLocaleString()],
  ] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/65 backdrop-blur-sm" className="max-h-[92vh] w-[calc(100%-2rem)] max-w-[650px] gap-5 overflow-y-auto rounded-lg border border-[#CBA24A]/20 bg-[#4A2D1D] p-6 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <DialogHeader><DialogTitle className="pr-8 font-serif text-2xl font-semibold text-[#D6AA50]">Product Details</DialogTitle><DialogDescription className="sr-only">Complete inventory product details</DialogDescription></DialogHeader>
        <DialogClose asChild><button type="button" aria-label="Close product preview" className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-md bg-[#D6AA50] text-[#4A2D1D] hover:bg-[#E7BF69]"><X className="h-5 w-5" /></button></DialogClose>
        {productQuery.isLoading ? <p className="py-12 text-center text-sm text-[#BFA98A]">Loading product...</p>
          : productQuery.isError ? <p className="py-12 text-center text-sm text-red-300">{productQuery.error.message}</p>
          : product ? <>
            {product.image && <div className="flex justify-center"><Image src={product.image} alt={product.name || "Inventory product"} width={180} height={180} className="h-44 w-44 rounded-lg border border-[#CBA24A]/25 object-cover" /></div>}
            <div className="flex justify-center"><StatusBadge status={product.status} /></div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{details.map(([label, value]) => <div key={label}><dt className="mb-1 text-xs font-semibold text-[#F7E4B3]">{label}</dt><dd className="text-sm capitalize text-[#BFA98A]">{value || "—"}</dd></div>)}</dl>
            <div><p className="mb-1 text-xs font-semibold">Description</p><p className="text-sm leading-6 text-[#BFA98A]">{product.description || "—"}</p></div>
            {(product.staffPickNote || product.featuredNote) && <div className="rounded-md border border-[#CBA24A]/10 bg-[#5A3826] p-3 text-xs text-[#BFA98A]">{product.staffPickNote || product.featuredNote}</div>}
            <div className="grid grid-cols-2 gap-2"><button type="button" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate("inactive")} className="h-10 cursor-pointer rounded border border-[#D6AA50] text-xs font-medium hover:bg-[#D6AA50]/10 disabled:cursor-not-allowed disabled:opacity-50">Set Inactive</button><button type="button" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate("active")} className="h-10 cursor-pointer rounded bg-[#D6AA50] text-xs font-semibold text-[#3A2417] hover:bg-[#E7BF69] disabled:cursor-not-allowed disabled:opacity-50">Set Active</button></div>
          </> : null}
      </DialogContent>
    </Dialog>
  );
}
