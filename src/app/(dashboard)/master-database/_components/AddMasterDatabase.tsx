"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cigar } from "./MasterDatabase";

export type CigarFormValues = {
  name: string;
  brand: string;
  description?: string;
  manufacturer?: string;
  country?: string;
  price?: number;
  status?: "active" | "under_review" | "out_of_stock" | "inactive";
};

interface Props {
  open: boolean;
  initial?: Cigar | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CigarFormValues) => void;
}

const inputClass =
  "h-10 w-full rounded-[4px] border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none placeholder:text-[#B9AA9F]/65 focus:border-[#D6AA50] focus:ring-1 focus:ring-[#D6AA50]/30";
const labelClass = "space-y-1.5 text-xs font-medium text-[#F4D77B]";

export default function AddMasterDatabase({
  open,
  initial,
  pending,
  onOpenChange,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const changeOpen = (value: boolean) => {
    if (!value) setErrors({});
    onOpenChange(value);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const brand = String(data.get("brand") || "").trim();
    const priceValue = String(data.get("price") || "").trim();
    const price = priceValue ? Number(priceValue) : undefined;
    const nextErrors: Record<string, string> = {};

    if (!name) nextErrors.name = "Product name is required.";
    if (!brand) nextErrors.brand = "Brand is required.";
    if (
      priceValue &&
      (price === undefined || !Number.isFinite(price) || price < 0)
    ) {
      nextErrors.price = "Enter a valid price of 0 or more.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit({
      name,
      brand,
      description: String(data.get("description") || "").trim() || undefined,
      manufacturer:
        String(data.get("manufacturer") || "").trim() || undefined,
      country: String(data.get("country") || "").trim() || undefined,
      price,
      status: String(data.get("status") || "active") as CigarFormValues["status"],
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !pending && changeOpen(value)}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-[570px] gap-0 overflow-hidden rounded-lg border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl font-semibold text-[#F1C75B]">
            {initial ? "Edit Product" : "Add Product Manually"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Master database product form
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close"
          disabled={pending}
          onClick={() => changeOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#E6C66D] hover:bg-[#D6AA50]/15"
        >
          <X className="h-5 w-5" />
        </button>

        <form
          key={initial?._id || "new"}
          onSubmit={submit}
          noValidate
          className="grid max-h-[calc(92vh-65px)] grid-cols-1 gap-x-3 gap-y-3 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid-cols-2"
        >
          <Field
            name="name"
            label="Product Name"
            required
            defaultValue={initial?.name}
            error={errors.name}
          />
          <Field
            name="brand"
            label="Brand"
            required
            defaultValue={initial?.brand}
            error={errors.brand}
          />
          <Field
            name="manufacturer"
            label="Manufacturer"
            defaultValue={initial?.manufacturer}
          />
          <Field
            name="country"
            label="Country"
            defaultValue={initial?.country}
          />
          <Field
            name="price"
            label="Price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.price}
            error={errors.price}
          />
          <label className={labelClass}>
            <span>Status</span>
            <Select name="status" defaultValue={initial?.status || "active"}>
              <SelectTrigger className={`${inputClass} shadow-none focus-visible:ring-0`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="border-[#CBA24A]/25 bg-[#4A2D1D] text-[#F7E4B3]"
              >
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            <span>Description</span>
            <textarea
              name="description"
              defaultValue={initial?.description}
              className={`${inputClass} h-24 resize-none py-2.5 leading-5`}
            />
          </label>

          <div className="grid grid-cols-2 gap-3 pt-1 sm:col-span-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => changeOpen(false)}
              className="h-10 cursor-pointer rounded border border-[#D6AA50] text-xs text-[#F4D77B] hover:bg-[#D6AA50]/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-10 cursor-pointer rounded bg-[#D6AA50] text-xs font-semibold text-[#3A2417] hover:bg-[#E7BF69] disabled:opacity-50"
            >
              {pending ? "Saving..." : initial ? "Save" : "Add Product"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className={labelClass}>
      <span>
        {label}
        {props.required ? " *" : ""}
      </span>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${error ? "border-red-500/70" : ""}`}
      />
      {error && (
        <span className="block normal-case tracking-normal text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}
