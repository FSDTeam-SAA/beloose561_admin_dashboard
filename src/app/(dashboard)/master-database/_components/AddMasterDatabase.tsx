"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Cigar } from "./MasterDatabase";

export type CigarFormValues = Omit<Partial<Cigar>, "_id" | "createdAt" | "updatedAt" | "image"> & {
  price: number;
  image?: File;
};
interface Props { open: boolean; initial?: Cigar | null; pending?: boolean; onOpenChange: (open: boolean) => void; onSubmit: (values: CigarFormValues) => void }

const inputClass = "h-10 w-full rounded-[4px] border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none placeholder:text-[#B9AA9F]/65 focus:border-[#D6AA50] focus:ring-1 focus:ring-[#D6AA50]/30";
const labelClass = "space-y-1.5 text-xs font-medium text-[#F4D77B]";
const pairingOptions = [
  { value: "Cigar + Whisky", description: "Classic pairing, especially for medium or full-bodied cigars" },
  { value: "Cigar + Aged Rum", description: "Sweet caramel and vanilla notes" },
  { value: "Cigar + Cognac / Brandy", description: "Smooth, premium pairing" },
  { value: "Cigar + Port", description: "Sweetness balances tobacco spice and earthiness" },
  { value: "Cigar + Coffee / Espresso", description: "Non-alcoholic pairing for creamy or nutty cigars" },
  { value: "Cigar + Dark Beer / Stout", description: "Rich pairing for bold cigars" },
];

export default function AddMasterDatabase({ open, initial, pending, onOpenChange, onSubmit }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const changeOpen = (value: boolean) => {
    if (!value) setErrors({});
    onOpenChange(value);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const brand = String(data.get("brand") || "").trim();
    const name = String(data.get("name") || "").trim();
    const priceValue = String(data.get("price") || "").trim();
    const price = Number(priceValue);
    const nextErrors: Record<string, string> = {};

    if (!brand) nextErrors.brand = "Brand is required.";
    if (!name) nextErrors.name = "Name is required.";
    if (!priceValue) nextErrors.price = "Price is required.";
    else if (!Number.isFinite(price) || price < 0) nextErrors.price = "Enter a valid price of 0 or more.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const image = data.get("image");
    setErrors({});
    onSubmit({
      brand, name,
      wrapper: String(data.get("wrapper") || "habano"),
      strength: String(data.get("strength") || "medium"), size: String(data.get("size") || "").trim(),
      price, smokingTime: String(data.get("smokingTime") || "").trim(),
      description: String(data.get("description") || "").trim(),
      pairingSuggestions: String(data.get("pairingSuggestions") || "").split(",").map((value) => value.trim()).filter(Boolean),
      quantity: Number(data.get("quantity") || 0),
      lowStockThreshold: Number(data.get("lowStockThreshold") || 5),
      ...(image instanceof File && image.size > 0 ? { image } : {}),
    });
  };

  return <Dialog open={open} onOpenChange={(value) => !pending && changeOpen(value)}>
    <DialogContent showCloseButton={false} overlayClassName="bg-black/75 backdrop-blur-[2px]" className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-[570px] gap-0 overflow-hidden rounded-lg border border-[#A67C3D]/70 bg-[#5A351F] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]">
      <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5"><DialogTitle className="font-serif text-xl font-semibold text-[#F1C75B]">{initial ? "Edit Product" : "Add Product"}</DialogTitle><DialogDescription className="sr-only">Product form</DialogDescription></DialogHeader>
      <button type="button" aria-label="Close" disabled={pending} onClick={() => changeOpen(false)} className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#E6C66D] hover:bg-[#D6AA50]/15"><X className="h-5 w-5" /></button>
      <form key={initial?._id || "new"} onSubmit={submit} noValidate className="grid max-h-[calc(92vh-65px)] grid-cols-1 gap-x-3 gap-y-3 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid-cols-2">
        <Field name="name" label="Cigar Name" defaultValue={initial?.name} error={errors.name} />
        <Field name="brand" label="Brand" defaultValue={initial?.brand} error={errors.brand} />
        <SelectField name="strength" label="Strength *" defaultValue={initial?.strength?.toLowerCase() || ""} placeholder="Choose one" options={["Mild", "Medium", "Medium-Full", "Full"]} />
        <SelectField name="wrapper" label="Wrapper *" defaultValue={initial?.wrapper?.toLowerCase() || ""} placeholder="Choose one" options={[initial?.wrapper, "Habano", "Connecticut", "Maduro", "Corojo", "Natural", "Cameroon"].filter((value, index, values): value is string => Boolean(value) && values.findIndex((item) => item?.toLowerCase() === value?.toLowerCase()) === index)} />
        <Field name="size" label="Size" defaultValue={initial?.size} />
        <SelectField name="smokingTime" label="Smoking Time *" defaultValue={initial?.smokingTime || ""} placeholder="Choose one" options={["30", "60", "90", "120+"]} preserveCase />
        <Field name="quantity" label="Quantity" type="number" min="0" defaultValue={initial?.quantity ?? 0} />
        <Field name="price" label="Retail Price" type="number" min="0" step="0.01" defaultValue={initial?.price ?? 0} error={errors.price} />
        <Field name="lowStockThreshold" label="Minimum Stock" type="number" min="0" defaultValue={initial?.lowStockThreshold ?? 5} />
        <TextArea name="description" label="Description" defaultValue={initial?.description} />
        <PairingMultiSelect key={initial?._id || "new-pairings"} defaultValues={initial?.pairingSuggestions} />
        <ImagePicker key={initial?._id || "new-image"} defaultImage={initial?.image} productName={initial?.name} />
        <div className="grid grid-cols-2 gap-3 pt-1 sm:col-span-2"><button type="button" disabled={pending} onClick={() => changeOpen(false)} className="h-10 cursor-pointer rounded border border-[#D6AA50] text-xs text-[#F4D77B] hover:bg-[#D6AA50]/10 disabled:opacity-50">Cancel</button><button type="submit" disabled={pending} className="h-10 cursor-pointer rounded bg-[#D6AA50] text-xs font-semibold text-[#3A2417] hover:bg-[#E7BF69] disabled:opacity-50">{pending ? "Saving..." : initial ? "Save" : "Add Product"}</button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

function Field({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) { return <label className={labelClass}><span>{label}{props.required ? " *" : ""}</span><input {...props} aria-invalid={Boolean(error)} className={`${inputClass} ${error ? "border-red-500/70" : ""}`} />{error && <span className="block normal-case tracking-normal text-red-400">{error}</span>}</label>; }
function TextArea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) { return <label className={`${labelClass} sm:col-span-2`}><span>{label}</span><textarea name={name} defaultValue={defaultValue} className={`${inputClass} h-20 resize-none py-2.5 leading-5`} /></label>; }
function SelectField({ name, label, defaultValue, placeholder, options, values, preserveCase }: { name: string; label: string; defaultValue: string; placeholder?: string; options: string[]; values?: string[]; preserveCase?: boolean }) { return <label className={labelClass}><span>{label}</span><Select name={name} defaultValue={defaultValue || undefined}><SelectTrigger className={`${inputClass} shadow-none focus-visible:ring-0`}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent position="popper" className="border-[#CBA24A]/25 bg-[#5A351F] text-[#F7E4B3]">{options.map((option, index) => <SelectItem key={option} value={values?.[index] || (preserveCase ? option : option.toLowerCase())} className="focus:bg-[#D6AA50]/15 focus:text-[#F7E4B3]">{option}{preserveCase ? " minutes" : ""}</SelectItem>)}</SelectContent></Select></label>; }

function PairingMultiSelect({ defaultValues = [] }: { defaultValues?: string[] }) {
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  return (
    <div className={`${labelClass} sm:col-span-2`}>
      <span>Pairing Suggestions</span>
      <input type="hidden" name="pairingSuggestions" value={selected.join(",")} />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className="inline-flex items-center gap-1 rounded-full border border-[#D6AA50]/50 bg-[#2E1B0D] px-2.5 py-1 text-[10px] text-[#F4D77B]"
            >
              {value}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
      <details className="group relative">
        <summary className={`${inputClass} flex cursor-pointer list-none items-center justify-between`}>
          <span className={selected.length ? "text-[#F8E8C4]" : "text-[#B9AA9F]/65"}>
            {selected.length ? `${selected.length} pairing${selected.length > 1 ? "s" : ""} selected` : "Choose pairings"}
          </span>
          <span className="text-[#CDB37A] transition group-open:rotate-180">⌄</span>
        </summary>
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-[4px] border border-[#A67C3D] bg-[#5A351F] p-1 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pairingOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer gap-3 rounded px-3 py-2.5 hover:bg-[#D6AA50]/10">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#D6AA50]"
              />
              <span>
                <span className="block text-xs font-medium text-[#F8E8C4]">{option.value}</span>
                <span className="mt-1 block text-[10px] font-normal text-[#CDB37A]">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </details>
      <span className="block text-[10px] font-normal text-[#CDB37A]">
        Choose one or more. Selected pairings can be removed above.
      </span>
    </div>
  );
}

function ImagePicker({ defaultImage, productName }: { defaultImage?: string; productName?: string }) {
  const [preview, setPreview] = useState(defaultImage);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const selectImage = (file?: File) => {
    setPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : defaultImage;
    });
  };

  return (
    <label className={`${labelClass} sm:col-span-2`}>
      <span>Image</span>
      <span className="flex min-h-20 items-center gap-3 rounded-[4px] border border-[#A67C3D] bg-[#6A4833]/55 p-2">
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-[#3E290F] text-xl text-[#D6AA50]">
          {preview ? (
            <Image src={preview} alt={productName || "Product preview"} fill unoptimized className="object-cover" />
          ) : (
            "C"
          )}
        </span>
        <span className="min-w-0">
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => selectImage(event.target.files?.[0])}
            className="block max-w-full text-xs text-[#CDB37A] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-[#E4AD33] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#3A2417]"
          />
          <span className="mt-2 block truncate text-[10px] font-normal text-[#CDB37A]">
            {preview ? "Current image preview. Choose a file to replace it." : "Large images are optimized automatically before upload."}
          </span>
        </span>
      </span>
    </label>
  );
}
