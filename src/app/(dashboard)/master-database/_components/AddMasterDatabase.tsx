"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
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
  productLine: string;
  brand: string;
  upcCodes?: string[];
  name?: string;
  manufacturer?: string;
  country?: string;
  originRegion?: string;
  vitola?: string;
  thumbnail?: string;
  tastingNotes?: string;
  strength?: string;
  wrapper?: string;
  binder?: string;
  filler?: string[];
  size?: string;
  length?: string;
  ringGauge?: number;
  flavorNotes?: string[];
  description?: string;
  whyYoullLikeThis?: string;
  image?: string;
  estimatedSmokingTime?: string;
  pairingSuggestions?: string[];
  suggestedRetailPriceEach?: number;
  suggestedRetailPricePerBox?: number;
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

const strengthOptions = [
  "Medium-Full",
  "Full",
  "Medium",
  "Mild-Medium",
  "Mild",
];

const wrapperOptions = [
  "Ecuadorian Connecticut",
  "Mexican San Andrés",
  "Ecuadorian Habano",
  "Nicaraguan",
  "Habano",
  "Ecuadorian Sumatra",
  "Nicaraguan Habano",
  "Nicaraguan Corojo",
  "Ecuadorian",
  "Connecticut Broadleaf",
  "Cameroon",
  "Honduran Corojo",
  "Honduran",
  "Connecticut Shade",
  "Connecticut",
  "Ecuadorian Corojo",
  "Maduro",
  "Natural",
  "Sumatra",
  "Pennsylvania Broadleaf",
];

const pairingOptions = [
  "Cigar + Whiskey",
  "Cigar + Aged Rum",
  "Cigar + Dark Beer / Stout",
  "Cigar + Cognac / Brandy",
  "Cigar + Coffee / Espresso",
];

export default function AddMasterDatabase({
  open,
  initial,
  pending,
  onOpenChange,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pairings, setPairings] = useState<string[]>([""]);

  useEffect(() => {
    if (!open) return;
    setPairings(
      initial?.pairingSuggestions?.length ? initial.pairingSuggestions : [""],
    );
  }, [initial, open]);

  const changeOpen = (value: boolean) => {
    if (!value) setErrors({});
    onOpenChange(value);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const productLine = String(data.get("productLine") || "").trim();
    const brand = String(data.get("brand") || "").trim();
    const eachValue = String(data.get("suggestedRetailPriceEach") || "").trim();
    const boxValue = String(
      data.get("suggestedRetailPricePerBox") || "",
    ).trim();
    const suggestedRetailPriceEach = eachValue ? Number(eachValue) : undefined;
    const suggestedRetailPricePerBox = boxValue ? Number(boxValue) : undefined;
    const nextErrors: Record<string, string> = {};

    if (!productLine) nextErrors.productLine = "Product line is required.";
    if (!brand) nextErrors.brand = "Brand is required.";
    if (
      eachValue &&
      (!Number.isFinite(suggestedRetailPriceEach) ||
        suggestedRetailPriceEach! < 0)
    ) {
      nextErrors.suggestedRetailPriceEach = "Enter a valid price of 0 or more.";
    }
    if (
      boxValue &&
      (!Number.isFinite(suggestedRetailPricePerBox) ||
        suggestedRetailPricePerBox! < 0)
    ) {
      nextErrors.suggestedRetailPricePerBox =
        "Enter a valid box price of 0 or more.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const text = (name: string) =>
      String(data.get(name) || "").trim() || undefined;
    const list = (name: string) =>
      String(data.get(name) || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    const ringGaugeValue = text("ringGauge");
    const ringGauge = ringGaugeValue ? Number(ringGaugeValue) : undefined;
    if (ringGaugeValue && (!Number.isInteger(ringGauge) || ringGauge! < 1)) {
      setErrors({
        ringGauge: "Ring gauge must be a whole number of 1 or more.",
      });
      return;
    }

    setErrors({});
    onSubmit({
      productLine,
      brand,
      upcCodes: list("upcCodes"),
      name: text("name"),
      manufacturer: text("manufacturer"),
      country: text("country"),
      originRegion: text("originRegion"),
      vitola: text("vitola"),
      thumbnail: text("thumbnail"),
      tastingNotes: text("tastingNotes"),
      strength: text("strength"),
      wrapper: text("wrapper"),
      binder: text("binder"),
      filler: list("filler"),
      size: text("size"),
      length: text("length"),
      ringGauge,
      flavorNotes: list("flavorNotes"),
      description: text("description"),
      whyYoullLikeThis: text("whyYoullLikeThis"),
      image: text("image"),
      estimatedSmokingTime: text("estimatedSmokingTime"),
      pairingSuggestions: pairings.map((item) => item.trim()).filter(Boolean),
      suggestedRetailPriceEach,
      suggestedRetailPricePerBox,
      status: String(
        data.get("status") || "active",
      ) as CigarFormValues["status"],
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
            name="productLine"
            label="Product Line"
            required
            placeholder="e.g. Gran Reserva — Robusto"
            defaultValue={initial?.productLine}
            error={errors.productLine}
          />
          <Field
            name="brand"
            label="Brand"
            required
            defaultValue={initial?.brand}
            error={errors.brand}
          />
          <Field name="name" label="Name" defaultValue={initial?.name} />
          <Field
            name="upcCodes"
            label="UPC Codes"
            placeholder="Separate multiple UPCs with commas"
            defaultValue={initial?.upcCodes?.join(", ")}
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
            name="originRegion"
            label="Origin Region"
            defaultValue={initial?.originRegion}
          />
          <Field name="vitola" label="Vitola" defaultValue={initial?.vitola} />
          <Field name="size" label="Size" defaultValue={initial?.size} />
          <Field name="length" label="Length" defaultValue={initial?.length} />
          <Field
            name="ringGauge"
            label="Ring Gauge"
            type="number"
            min="1"
            step="1"
            defaultValue={initial?.ringGauge}
            error={errors.ringGauge}
          />
          <Field name="binder" label="Binder" defaultValue={initial?.binder} />
          <Field
            name="filler"
            label="Filler"
            placeholder="Separate multiple fillers with commas"
            defaultValue={initial?.filler?.join(", ")}
          />
          <Field
            name="flavorNotes"
            label="Flavor Notes"
            placeholder="Separate multiple flavors with commas"
            defaultValue={initial?.flavorNotes?.join(", ")}
          />
          <Field
            name="thumbnail"
            label="Thumbnail URL"
            type="url"
            defaultValue={initial?.thumbnail}
          />
          <Field
            name="image"
            label="Image URL"
            type="url"
            defaultValue={initial?.image}
          />
          <label className={` sm:col-span-2`}>
            <span>Tasting Notes</span>
            <textarea
              name="tastingNotes"
              defaultValue={initial?.tastingNotes}
              className={` h-20 resize-y py-2`}
            />
          </label>
          <label className={` sm:col-span-2`}>
            <span>Description</span>
            <textarea
              name="description"
              defaultValue={initial?.description}
              className={` h-20 resize-y py-2`}
            />
          </label>
          <label className={` sm:col-span-2`}>
            <span>Why You&apos;ll Like This</span>
            <textarea
              name="whyYoullLikeThis"
              defaultValue={initial?.whyYoullLikeThis}
              className={` h-20 resize-y py-2`}
            />
          </label>
          <SelectField
            name="strength"
            label="Strength"
            placeholder="Select strength"
            defaultValue={initial?.strength}
            options={strengthOptions}
          />
          <SelectField
            name="wrapper"
            label="Wrapper"
            placeholder="Select wrapper"
            defaultValue={initial?.wrapper}
            options={wrapperOptions}
          />
          <Field
            name="estimatedSmokingTime"
            label="Estimated Smoking Time"
            placeholder="e.g. 1 Hour"
            defaultValue={initial?.estimatedSmokingTime}
          />
          <Field
            name="suggestedRetailPriceEach"
            label="Retail Price (Each)"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.suggestedRetailPriceEach}
            error={errors.suggestedRetailPriceEach}
          />
          <Field
            name="suggestedRetailPricePerBox"
            label="Retail Price (Per Box)"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.suggestedRetailPricePerBox}
            error={errors.suggestedRetailPricePerBox}
          />
          <label className={labelClass}>
            <span>Status</span>
            <Select name="status" defaultValue={initial?.status || "active"}>
              <SelectTrigger
                className={`${inputClass} shadow-none focus-visible:ring-0`}
              >
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
          <div className={`${labelClass} sm:col-span-2`}>
            <span>Pairing Suggestions</span>
            <div className="space-y-2">
              {pairings.map((pairing, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={pairing}
                    onValueChange={(value) =>
                      setPairings((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? value : item,
                        ),
                      )
                    }
                  >
                    <SelectTrigger
                      className={`${inputClass} shadow-none focus-visible:ring-0`}
                    >
                      <SelectValue
                        placeholder={`Select pairing ${index + 1}`}
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="border-[#CBA24A]/25 bg-[#4A2D1D] text-[#F7E4B3]"
                    >
                      {pairingOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {index === pairings.length - 1 ? (
                    <button
                      type="button"
                      aria-label="Add pairing suggestion"
                      onClick={() => setPairings((current) => [...current, ""])}
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded bg-[#D6AA50] text-[#3A2417] hover:bg-[#E7BF69]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Remove pairing ${index + 1}`}
                      onClick={() =>
                        setPairings((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded border border-red-500/40 text-red-400 hover:bg-red-950/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

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

function SelectField({
  name,
  label,
  placeholder,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  options: string[];
}) {
  return (
    <label className={labelClass}>
      <span>{label}</span>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger
          className={`${inputClass} shadow-none focus-visible:ring-0`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="max-h-64 border-[#CBA24A]/25 bg-[#4A2D1D] text-[#F7E4B3]"
        >
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
