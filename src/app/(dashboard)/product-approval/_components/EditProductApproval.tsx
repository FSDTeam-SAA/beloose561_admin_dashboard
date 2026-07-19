"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductSubmission } from "./ViewProduct";

interface EditProductApprovalProps {
  open: boolean;
  product: ProductSubmission | null;
  onOpenChange: (open: boolean) => void;
  onSave: (product: ProductSubmission, productName: string) => void;
}

const inputClass =
  "h-9 w-full rounded-md border border-transparent bg-[#62432F] px-3 text-xs text-[#F8E8C4] outline-none placeholder:text-[#C9B697]/70 transition focus:border-[#D6AA50]/70";

const fields = [
  { name: "cigarName", label: "Cigar Name" },
  { name: "brand", label: "Brand", defaultValue: "Cohiba" },
] as const;

export default function EditProductApproval({
  open,
  product,
  onOpenChange,
  onSave,
}: EditProductApprovalProps) {
  const [productName, setProductName] = useState("");
  const [imageName, setImageName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) setProductName(product.product);
    if (!open) setImageName("");
  }, [open, product]);

  if (!product) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = productName.trim();
    if (!trimmedName) return;
    onSave(product, trimmedName);
    onOpenChange(false);
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    setImageName(event.target.files?.[0]?.name ?? "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="max-h-[92vh] w-[calc(100%-2rem)] max-w-[580px] gap-0 overflow-y-auto rounded-xl border border-[#CBA24A]/15 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <DialogHeader className="px-5 pb-4 pt-5 sm:px-6">
          <DialogTitle className="pr-8 font-serif text-2xl font-semibold text-[#D6AA50]">
            Edit Product
          </DialogTitle>
          <DialogDescription className="sr-only">
            Edit details for {product.product}
          </DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close edit product"
            className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-lg rounded-tr-xl bg-[#D6AA50] text-[#4A2D1D] transition-colors hover:bg-[#E7BF69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7E4B3]"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className="space-y-1.5 text-[11px] font-medium">
                <span>{field.label}</span>
                <input
                  className={inputClass}
                  value={field.name === "cigarName" ? productName : undefined}
                  defaultValue={field.name === "brand" ? field.defaultValue : undefined}
                  onChange={field.name === "cigarName" ? (event) => setProductName(event.target.value) : undefined}
                  required={field.name === "cigarName"}
                />
              </label>
            ))}
            <SelectField label="Wrapper" defaultValue="Natural" options={["Natural", "Maduro", "Connecticut"]} />
            <SelectField label="Strength" defaultValue="Medium" options={["Mild", "Medium", "Full"]} />
            <SelectField label="Humidor" defaultValue="" options={["Select Humidor", "Main Humidor", "Reserve Humidor"]} />
            <SelectField label="Shelf" defaultValue="" options={["Select Humidor First"]} />
            <SelectField label="Category / Vitola" defaultValue="" options={["Select", "Robusto", "Toro", "Churchill", "Corona"]} />
            <TextField label="Country of Origin" defaultValue="Cuba" />
            <TextField label="Price ($)" type="number" defaultValue="10" min="0" step="0.01" />
            <TextField label="Quantity" type="number" defaultValue="10" min="0" />
          </div>

          <TextField label="Ring Gauge" type="number" defaultValue="50" min="0" />
          <TextField label="Initial Stock" type="number" defaultValue="48" min="0" />

          <div className="space-y-1.5">
            <span className="block text-[11px] font-medium">Image</span>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleImage} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#D9C6A5]/80 text-[#D9C6A5] transition hover:border-[#D6AA50] hover:bg-[#5A3826]/50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6A482D] text-[#D6AA50] shadow-[0_0_0_5px_rgba(214,170,80,0.08)]">
                <Upload className="h-4 w-4" />
              </span>
              <span className="max-w-[90%] truncate text-[11px]">
                {imageName || "Upload cigar Image (JPG, PNG)"}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#E8D8B8]">
            {["Staff Pick", "New Arrival", "Daily Feature"].map((label) => (
              <label key={label} className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" className="h-4 w-4 accent-[#D6AA50]" />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button type="button" onClick={() => onOpenChange(false)} className="h-9 cursor-pointer rounded border border-[#D6AA50] text-[11px] transition hover:bg-[#D6AA50]/10">
              Cancel
            </button>
            <button type="submit" className="h-9 cursor-pointer rounded bg-[#D6AA50] text-[11px] font-semibold text-[#3A2417] transition hover:bg-[#E7BF69]">
              Update
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TextField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="space-y-1.5 text-[11px] font-medium">
      <span>{label}</span>
      <input {...props} className={inputClass} />
    </label>
  );
}

function SelectField({ label, options, defaultValue }: { label: string; options: string[]; defaultValue: string }) {
  return (
    <label className="space-y-1.5 text-[11px] font-medium">
      <span>{label}</span>
      <select defaultValue={defaultValue} className={`${inputClass} cursor-pointer appearance-auto`}>
        {options.map((option) => <option key={option} value={option === "Select" || option.startsWith("Select ") ? "" : option}>{option}</option>)}
      </select>
    </label>
  );
}
