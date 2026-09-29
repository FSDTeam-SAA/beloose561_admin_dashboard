"use client";

import Image from "next/image";
import { X, Tag, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export interface MasterCigar {
  _id: string;
  productLine?: string;
  name?: string;
  brand?: string;
  upcCodes?: string[];
  manufacturer?: string;
  country?: string;
  originRegion?: string;
  vitola?: string;
  strength?: string;
  wrapper?: string;
  binder?: string;
  filler?: string[];
  status?: string;
  price?: number;
  suggestedRetailPriceEach?: number;
  suggestedRetailPricePerBox?: number;
}

export interface InventoryItem {
  _id: string;
  userId: string | InventoryUser;
  retailerId: string | InventoryRetailer;
  masterCigarId?: string | MasterCigar;
  name?: string;
  brand?: string;
  strength?: string;
  wrapper?: string;
  size?: string;
  image?: string;
  description?: string;
  smokingTime?: string;
  pairingSuggestions?: string[];
  humidorId: string | InventoryHumidor;
  wallName?: string;
  shelfName: string;
  shelfRow?: number;
  shelfColumn?: number;
  quantity: number;
  price: number;
  pricePerBox?: number;
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

export function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toLowerCase() || "unknown";
  const style =
    normalized === "active"
      ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
      : normalized === "inactive" || normalized === "out_of_stock"
        ? "border-red-500/25 bg-red-950/60 text-red-400"
        : "border-amber-600/30 bg-amber-950/60 text-amber-400";
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold capitalize ${style}`}
    >
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

export default function ViewProduct({
  product,
  onOpenChange,
}: {
  product: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const user =
    product?.userId && typeof product.userId !== "string"
      ? product.userId
      : undefined;
  const retailer =
    product?.retailerId && typeof product.retailerId !== "string"
      ? product.retailerId
      : undefined;
  const humidor =
    product?.humidorId && typeof product.humidorId !== "string"
      ? product.humidorId
      : undefined;
  const masterCigar =
    product?.masterCigarId && typeof product.masterCigarId !== "string"
      ? product.masterCigarId
      : undefined;

  const locationString = [
    humidor?.name || "Humidor",
    product?.wallName ? `Wall: ${product.wallName}` : null,
    product?.shelfName ? `Shelf: ${product.shelfName}` : null,
    typeof product?.shelfColumn === "number"
      ? `Col: ${product.shelfColumn}`
      : null,
  ]
    .filter(Boolean)
    .join(" → ");

  const details = product
    ? [
        ["Brand", product.brand],
        ["Strength", product.strength],
        ["Wrapper", product.wrapper],
        ["Size", product.size],
        ["Exact Location", locationString],
        ["Quantity in Stock", String(product.quantity)],
        ["Price (Each)", `$${product.price.toLocaleString()}`],
        [
          "Price (Per Box)",
          typeof product.pricePerBox === "number"
            ? `$${product.pricePerBox.toLocaleString()}`
            : "—",
        ],
        ["Low Stock Threshold", String(product.lowStockThreshold ?? "—")],
        ["Staff Pick", product.isStaffPick ? "Yes" : "No"],
        ["New Arrival", product.isNewArrival ? "Yes" : "No"],
        ["Daily Featured", product.isDailyFeatured ? "Yes" : "No"],
      ]
    : [];

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[820px] gap-4 overflow-y-auto rounded-2xl border border-[#CBA24A]/20 bg-[#4A2D1D] p-5 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <DialogHeader>
          <DialogTitle className="pr-8 font-serif text-xl font-normal">
            Product & Inventory Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Inventory product details
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close product details"
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 cursor-pointer text-[#A99D91] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-[112px_1fr] items-center gap-4 rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-3">
          {product?.image ? (
            <div className="relative h-24 w-28 overflow-hidden rounded-lg border border-[#CBA24A]/25">
              <Image
                src={product.image}
                alt={product.name || "Inventory product"}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-24 w-28 items-center justify-center rounded-lg border border-dashed border-[#CBA24A]/25 text-xs text-[#8F8278]">
              No image
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-serif text-xl">
              {product?.name || "Unnamed Product"}
            </h3>
            <p className="mt-1 truncate text-sm text-[#BFA98A]">
              {product?.brand || "—"}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <StatusBadge status={product?.status} />
              {product?.isStaffPick && (
                <span className="rounded bg-[#D6AA50]/20 px-2 py-0.5 text-[10px] font-medium text-[#D6AA50]">
                  Staff Pick
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Master Cigar Link */}
        {masterCigar && (
          <section className="rounded-xl border border-[#CBA24A]/20 bg-[#2b1f17] p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
              <Tag className="h-3.5 w-3.5" />
              <span>Master Cigar Association</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div>
                <span className="text-[#A99D91]">Master Product Line: </span>
                <span className="font-semibold text-[#F7E4B3]">
                  {masterCigar.productLine || masterCigar.name || "—"}
                </span>
              </div>
              <div>
                <span className="text-[#A99D91]">UPC Codes: </span>
                <span className="font-mono text-[#F4D77B]">
                  {masterCigar.upcCodes?.join(", ") || "—"}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Location Box */}
        <section className="rounded-xl border border-[#CBA24A]/20 bg-[#2b1f17] p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
            <MapPin className="h-3.5 w-3.5" />
            <span>Store Physical Location</span>
          </div>
          <p className="font-mono text-xs text-[#F4D77B]">{locationString}</p>
        </section>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-[#CBA24A]/15 p-4">
          {details.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">
                {label}
              </dt>
              <dd className="truncate text-sm" title={value}>
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>

        {(user || retailer) && (
          <section className="rounded-xl border border-[#CBA24A]/15 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
              Retailer & Store Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] uppercase text-[#A99D91]">Store Name</div>
                <div className="font-medium text-[#F7E4B3]">
                  {retailer?.storeName || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#A99D91]">Owner Email</div>
                <div className="font-medium text-[#F7E4B3]">
                  {user?.email || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#A99D91]">Phone</div>
                <div className="font-medium text-[#F7E4B3]">
                  {retailer?.phoneNumber || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#A99D91]">City & Address</div>
                <div className="font-medium text-[#F7E4B3]">
                  {[retailer?.address, retailer?.city].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
