"use client";

import { TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export default function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  title = "Delete a Retailer",
  description,
  disabled = false,
}: DeleteModalProps) {
  const message =
    description ||
    `Are you sure you want to delete${itemName ? ` ${itemName}` : " this retailer"}?`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/30 backdrop-blur-sm"
        className="w-[calc(100%-2rem)] max-w-[460px] gap-5 rounded-lg border border-[#CBA24A]/20 bg-[#4A2D1D] p-6 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-semibold text-[#D6AA50]">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Delete confirmation
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CBA24A]/10 text-[#D6AA50]">
          <TriangleAlert className="h-5 w-5" />
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold text-[#F7E4B3]">
            Are You Sure?
          </p>
          <p className="text-xs leading-5 text-[#BFA98A]">{message}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <DialogClose asChild>
            <button
              type="button"
              disabled={disabled}
              className="h-10 cursor-pointer rounded border border-[#CBA24A]/45 bg-transparent text-xs font-medium text-[#F7E4B3] transition-colors hover:bg-[#CBA24A]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            disabled={disabled}
            onClick={onConfirm}
            className="h-10 cursor-pointer rounded border border-[#D6AA50] bg-[#D6AA50] text-xs font-semibold text-[#3A2417] transition-colors hover:border-[#E7BF69] hover:bg-[#E7BF69] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
