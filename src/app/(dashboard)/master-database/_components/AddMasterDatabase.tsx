"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Cigar } from "./MasterDatabase";

export type CigarFormValues = Omit<Partial<Cigar>, "_id" | "createdAt" | "updatedAt" | "image">;
interface Props { open: boolean; initial?: Cigar | null; pending?: boolean; onOpenChange: (open: boolean) => void; onSubmit: (values: CigarFormValues) => void }

const inputClass = "h-10 w-full rounded-xl border border-[#CBA24A]/20 bg-[#241e1a] px-3 text-sm text-[#F7E4B3] outline-none placeholder:text-[#84786e] focus:border-[#D6AA50]/70";
const labelClass = "space-y-1.5 text-[10px] font-medium uppercase tracking-wider text-[#A99D91]";

export default function AddMasterDatabase({ open, initial, pending, onOpenChange, onSubmit }: Props) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      brand: String(data.get("brand") || "").trim(), name: String(data.get("name") || "").trim(),
      productLine: String(data.get("productLine") || "").trim(), wrapper: String(data.get("wrapper") || "habano"),
      strength: String(data.get("strength") || "medium"), size: String(data.get("size") || "").trim(),
      ringGauge: data.get("ringGauge") ? Number(data.get("ringGauge")) : undefined,
      priceRange: String(data.get("priceRange") || "").trim(), country: String(data.get("country") || "").trim(),
      category: String(data.get("category") || "regular"),
      flavorNotes: String(data.get("flavorNotes") || "").split(",").map((value) => value.trim()).filter(Boolean),
      description: String(data.get("description") || "").trim(), whyYoullLikeThis: String(data.get("whyYoullLikeThis") || "").trim(),
    });
  };

  return <Dialog open={open} onOpenChange={(value) => !pending && onOpenChange(value)}>
    <DialogContent showCloseButton={false} overlayClassName="bg-black/75 backdrop-blur-[2px]" className="w-[calc(100%-2rem)] max-w-[512px] gap-0 overflow-hidden rounded-2xl border border-[#CBA24A]/20 bg-[#1b1816] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]">
      <DialogHeader className="px-6 pb-3 pt-5"><DialogTitle className="font-serif text-xl font-normal text-[#F7E4B3]">{initial ? "Edit Product" : "Add Product"}</DialogTitle><DialogDescription className="sr-only">Product form</DialogDescription></DialogHeader>
      <button type="button" aria-label="Close" disabled={pending} onClick={() => onOpenChange(false)} className="absolute right-5 top-5 cursor-pointer text-[#A99D91] hover:text-[#F7E4B3]"><X className="h-5 w-5" /></button>
      <form key={initial?._id || "new"} onSubmit={submit} className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-6 pb-5">
        <Field name="brand" label="Brand" required defaultValue={initial?.brand} /><Field name="name" label="Name" required defaultValue={initial?.name} />
        <Field name="productLine" label="Product Line" defaultValue={initial?.productLine} /><SelectField name="wrapper" label="Wrapper" defaultValue={initial?.wrapper?.toLowerCase() || "habano"} options={[initial?.wrapper, "Habano", "Connecticut", "Maduro", "Corojo", "Natural", "Dominican Habano", "Sun Grown Habano", "Mexican Maduro", "Cameroon"].filter((value, index, values): value is string => Boolean(value) && values.findIndex((item) => item?.toLowerCase() === value?.toLowerCase()) === index)} />
        <SelectField name="strength" label="Strength" defaultValue={initial?.strength?.toLowerCase() || "medium"} options={["Mild", "Medium", "Full"]} /><Field name="size" label="Size" defaultValue={initial?.size} />
        <Field name="ringGauge" label="Ring Gauge" type="number" defaultValue={initial?.ringGauge} /><Field name="priceRange" label="Price" defaultValue={initial?.priceRange} />
        <Field name="country" label="Origin" defaultValue={initial?.country} /><SelectField name="category" label="Category" defaultValue={initial?.category?.toLowerCase() || "regular"} options={["Regular", "Premium", "Limited Edition"]} />
        <label className={`${labelClass} col-span-2`}><span>Flavor Notes</span><input name="flavorNotes" defaultValue={initial?.flavorNotes?.join(", ")} placeholder="Cedar, cocoa, pepper" className={inputClass} /></label>
        <TextArea name="description" label="Description" defaultValue={initial?.description} /><TextArea name="whyYoullLikeThis" label="Why You’ll Like This Cigar" defaultValue={initial?.whyYoullLikeThis} />
        <div className="col-span-2 grid grid-cols-2 gap-3 pt-1"><button type="button" disabled={pending} onClick={() => onOpenChange(false)} className="h-11 cursor-pointer rounded-xl border border-[#CBA24A]/25 text-sm hover:bg-[#CBA24A]/10 disabled:opacity-50">Cancel</button><button type="submit" disabled={pending} className="h-11 cursor-pointer rounded-xl bg-[#D6AA50] text-sm font-semibold text-[#17120d] hover:bg-[#E7BF69] disabled:opacity-50">{pending ? "Saving..." : initial ? "Save" : "Add Product"}</button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className={labelClass}><span>{label}{props.required ? " *" : ""}</span><input {...props} className={inputClass} /></label>; }
function TextArea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) { return <label className={`${labelClass} col-span-2`}><span>{label}</span><textarea name={name} defaultValue={defaultValue} className={`${inputClass} h-[66px] resize-none py-2.5 normal-case leading-5`} /></label>; }
function SelectField({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: string; options: string[] }) { return <label className={labelClass}><span>{label}</span><Select name={name} defaultValue={defaultValue}><SelectTrigger className={`${inputClass} shadow-none focus-visible:ring-0`}><SelectValue /></SelectTrigger><SelectContent position="popper" className="border-[#CBA24A]/25 bg-[#241e1a] text-[#F7E4B3]">{options.map((option) => <SelectItem key={option} value={option.toLowerCase()} className="focus:bg-[#D6AA50]/15 focus:text-[#F7E4B3]">{option}</SelectItem>)}</SelectContent></Select></label>; }
