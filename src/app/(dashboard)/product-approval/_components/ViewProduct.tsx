"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InventoryUser {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
  verfied?: string;
  status?: string;
  isSubscription?: boolean;
  subscriptionExpiry?: string;
}

interface InventoryRetailer {
  _id: string;
  storeName?: string;
  address?: string;
  phoneNumber?: string;
  city?: string;
  storeSlug?: string;
  status?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

interface InventoryHumidor {
  _id: string;
  name?: string;
  location?: string;
  description?: string;
  isActive?: boolean;
}

interface MasterCigar {
  _id: string;
  name?: string;
  brand?: string;
  discoveryType?: string;
  status?: string;
  price?: number;
}

export interface InventoryItem {
  _id: string; userId: string | InventoryUser; retailerId: string | InventoryRetailer; masterCigarId?: string | MasterCigar; name?: string; brand?: string;
  strength?: string; wrapper?: string; size?: string; image?: string; description?: string;
  smokingTime?: string; pairingSuggestions?: string[];
  humidorId: string | InventoryHumidor; shelfName: string; quantity: number; price: number; isStaffPick?: boolean;
  staffPickNote?: string; staffPickBy?: string; isNewArrival?: boolean; arrivalDate?: string;
  newArrivalNote?: string; isDailyFeatured?: boolean; featuredNote?: string; featuredPrice?: number;
  status?: string; lowStockThreshold?: number; totalSearches?: number; totalViews?: number;
  createdAt: string; updatedAt?: string;
}

export function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toLowerCase() || "unknown";
  const style = normalized === "active"
    ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
    : normalized === "inactive"
      ? "border-red-500/25 bg-red-950/60 text-red-400"
      : "border-amber-600/30 bg-amber-950/60 text-amber-400";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold capitalize ${style}`}>{normalized.replaceAll("_", " ")}</span>;
}

export default function ViewProduct({ product, onOpenChange }: { product: InventoryItem | null; onOpenChange: (open: boolean) => void }) {
  const user = product?.userId && typeof product.userId !== "string" ? product.userId : undefined;
  const retailer = product?.retailerId && typeof product.retailerId !== "string" ? product.retailerId : undefined;
  const humidor = product?.humidorId && typeof product.humidorId !== "string" ? product.humidorId : undefined;
  const masterCigar = product?.masterCigarId && typeof product.masterCigarId !== "string" ? product.masterCigarId : undefined;
  const details = product ? [
    ["Brand", product.brand], ["Strength", product.strength], ["Wrapper", product.wrapper],
    ["Size", product.size], ["Shelf", product.shelfName], ["Quantity", String(product.quantity)],
    ["Price", `$${product.price.toLocaleString()}`], ["Low Stock", String(product.lowStockThreshold ?? "—")],
    ["Staff Pick", product.isStaffPick ? "Yes" : "No"], ["New Arrival", product.isNewArrival ? "Yes" : "No"],
  ] : [];

  return <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} overlayClassName="bg-black/70 backdrop-blur-sm" className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[820px] gap-4 overflow-y-auto rounded-2xl border border-[#CBA24A]/20 bg-[#4A2D1D] p-5 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <DialogHeader><DialogTitle className="pr-8 font-serif text-xl font-normal">Product Details</DialogTitle><DialogDescription className="sr-only">Inventory product details</DialogDescription></DialogHeader>
      <button type="button" aria-label="Close product details" onClick={() => onOpenChange(false)} className="absolute right-5 top-5 cursor-pointer text-[#A99D91] hover:text-white"><X className="h-5 w-5" /></button>
      <div className="grid grid-cols-[112px_1fr] items-center gap-4 rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-3">
        {product?.image ? <div className="relative h-24 w-28 overflow-hidden rounded-lg border border-[#CBA24A]/25"><Image src={product.image} alt={product.name || "Inventory product"} fill unoptimized className="object-cover" /></div> : <div className="flex h-24 w-28 items-center justify-center rounded-lg border border-dashed border-[#CBA24A]/25 text-xs text-[#8F8278]">No image</div>}
        <div className="min-w-0"><h3 className="truncate font-serif text-xl">{product?.name || "Unnamed Product"}</h3><p className="mt-1 truncate text-sm text-[#BFA98A]">{product?.brand || "—"}</p><div className="mt-3"><StatusBadge status={product?.status} /></div></div>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-[#CBA24A]/15 p-4">{details.map(([label, value]) => <div key={label} className="min-w-0"><dt className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">{label}</dt><dd className="truncate text-sm" title={value}>{value || "—"}</dd></div>)}</dl>

      {(user || retailer) && (
        <DetailSection title="Retailer & Owner">
          <DetailGrid
            items={[
              ["Owner", user?.fullName],
              ["Email", user?.email],
              ["User Verification", user?.verfied],
              ["User Status", user?.status],
              ["Store Name", retailer?.storeName],
              [
                "Store Location",
                [retailer?.address, retailer?.city].filter(Boolean).join(", "),
              ],
              ["Phone", retailer?.phoneNumber],
              ["Store Slug", retailer?.storeSlug],
              ["Retailer Status", retailer?.status],
              ["Subscription Plan", retailer?.subscriptionPlan],
              ["Subscription Status", retailer?.subscriptionStatus],
              [
                "Subscription Expiry",
                user?.subscriptionExpiry
                  ? new Date(user.subscriptionExpiry).toLocaleDateString()
                  : undefined,
              ],
            ]}
          />
        </DetailSection>
      )}

      {humidor && (
        <DetailSection title="Humidor">
          <DetailGrid
            items={[
              ["Humidor Name", humidor.name],
              ["Location", humidor.location],
              ["Shelf", product?.shelfName],
              ["Status", humidor.isActive ? "Active" : "Inactive"],
            ]}
          />
          {humidor.description && (
            <p className="mt-3 text-xs leading-5 text-[#D9C9B1]">
              {humidor.description}
            </p>
          )}
        </DetailSection>
      )}

      {masterCigar && (
        <DetailSection title="Master Database Product">
          <DetailGrid
            items={[
              ["Product", masterCigar.name],
              ["Brand", masterCigar.brand],
              ["Discovery Type", masterCigar.discoveryType],
              ["Status", masterCigar.status],
              [
                "Master Price",
                masterCigar.price === undefined
                  ? undefined
                  : `$${masterCigar.price.toLocaleString()}`,
              ],
            ]}
          />
        </DetailSection>
      )}

      <div className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-3"><p className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">Description</p><p className="line-clamp-3 text-xs leading-5">{product?.description || "—"}</p></div>
      {product?.pairingSuggestions?.length ? (
        <div className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-[#A99D91]">
            Pairing Suggestions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {product.pairingSuggestions.map((pairing) => (
              <span
                key={pairing}
                className="rounded-full border border-[#D6AA50]/25 bg-[#D6AA50]/10 px-2.5 py-1 text-[10px] text-[#E8C979]"
              >
                {pairing}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </DialogContent>
  </Dialog>;
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
        {title}
      </h4>
      {children}
    </section>
  );
}

function DetailGrid({ items }: { items: Array<[string, string | undefined]> }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">
            {label}
          </dt>
          <dd
            className="truncate text-sm capitalize text-[#F7E4B3]"
            title={value || "—"}
          >
            {value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
