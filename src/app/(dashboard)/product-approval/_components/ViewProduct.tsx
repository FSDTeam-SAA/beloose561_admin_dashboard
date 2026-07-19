"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ProductSubmission {
  id: number;
  product: string;
  retailer: string;
  submitted: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
}

interface ViewProductProps {
  open: boolean;
  product: ProductSubmission | null;
  onOpenChange: (open: boolean) => void;
  onApprove?: (product: ProductSubmission) => void;
  onReject?: (product: ProductSubmission) => void;
}

export default function ViewProduct({
  open,
  product,
  onOpenChange,
  onApprove,
  onReject,
}: ViewProductProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/65 backdrop-blur-sm"
        className="w-[calc(100%-2rem)] max-w-[520px] gap-5 overflow-hidden rounded-lg border border-[#CBA24A]/20 bg-[#4A2D1D] p-6 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <DialogHeader>
          <DialogTitle className="pr-8 font-serif text-2xl font-semibold text-[#D6AA50]">
            Product Submission Preview
          </DialogTitle>
          <DialogDescription className="sr-only">
            Submission details for {product.product}
          </DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close product preview"
            className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-md bg-[#D6AA50] text-[#4A2D1D] transition-colors hover:bg-[#E7BF69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7E4B3]"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        <dl className="space-y-4">
          <div>
            <dt className="mb-1 text-xs font-semibold text-[#F7E4B3]">Product Name</dt>
            <dd className="text-sm text-[#BFA98A]">{product.product}</dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-semibold text-[#F7E4B3]">Submitted By</dt>
            <dd className="text-sm text-[#BFA98A]">{product.retailer}</dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-semibold text-[#F7E4B3]">Submitted Date</dt>
            <dd className="text-sm text-[#BFA98A]">{product.submitted}</dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-semibold text-[#F7E4B3]">Status</dt>
            <dd>
              <StatusBadge status={product.status} />
            </dd>
          </div>
        </dl>

        <p className="rounded-md border border-[#CBA24A]/10 bg-[#5A3826] px-3 py-2.5 text-[11px] leading-4 text-[#9F8566]">
          Approving will add this product to the Master Database and notify the
          retailer. Rejecting will remove it from the queue.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onReject?.(product)}
            className="h-10 cursor-pointer rounded border border-[#D6AA50] text-xs font-medium text-[#F7E4B3] transition-colors hover:bg-[#D6AA50]/10"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => onApprove?.(product)}
            className="h-10 cursor-pointer rounded border border-[#D6AA50] bg-[#D6AA50] text-xs font-semibold text-[#3A2417] transition-colors hover:border-[#E7BF69] hover:bg-[#E7BF69]"
          >
            Approve
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StatusBadge({ status }: { status: ProductSubmission["status"] }) {
  const styles = {
    Pending: "border-amber-600/30 bg-amber-950/60 text-amber-400",
    "Under Review": "border-blue-500/25 bg-blue-950/60 text-blue-400",
    Approved: "border-emerald-500/25 bg-emerald-950/60 text-emerald-400",
    Rejected: "border-red-500/25 bg-red-950/60 text-red-400",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
