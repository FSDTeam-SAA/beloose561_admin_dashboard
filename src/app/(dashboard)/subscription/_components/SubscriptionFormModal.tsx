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
import type { Subscription } from "./DetaislSubscriptionModal";

export interface SubscriptionFormValues {
  planName: string;
  price: number;
  plan: "monthly" | "yearly";
  features: string[];
}

interface Props {
  open: boolean;
  initial?: Subscription | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SubscriptionFormValues) => void;
}

const inputClass =
  "h-10 w-full rounded-md border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none placeholder:text-[#B9AA9F]/65 focus:border-[#D6AA50] focus:ring-1 focus:ring-[#D6AA50]/30";
const labelClass = "space-y-1.5 text-xs font-medium text-[#F4D77B]";

export default function SubscriptionFormModal({
  open,
  initial,
  pending,
  onOpenChange,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [features, setFeatures] = useState<string[]>([""]);

  useEffect(() => {
    if (!open) return;
    setFeatures(initial?.features?.length ? initial.features : [""]);
  }, [initial, open]);

  const changeOpen = (value: boolean) => {
    if (!value) setErrors({});
    onOpenChange(value);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const planName = String(data.get("planName") || "").trim();
    const price = Number(data.get("price"));
    const submittedFeatures = data
      .getAll("features")
      .map(String)
      .map((feature) => feature.trim())
      .filter(Boolean);
    const nextErrors: Record<string, string> = {};

    if (!planName) nextErrors.planName = "Plan name is required.";
    if (!Number.isFinite(price) || price < 0) {
      nextErrors.price = "Enter a valid price of 0 or more.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit({
      planName,
      price,
      plan: String(data.get("plan") || "monthly") as "monthly" | "yearly",
      features: submittedFeatures,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !pending && changeOpen(value)}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="w-[calc(100%-1.5rem)] max-w-[560px] gap-0 overflow-hidden rounded-xl border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl font-semibold text-[#F1C75B]">
            {initial ? "Edit Subscription" : "Add Subscription"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#BFA98A]">
            {initial
              ? "Update the subscription plan details."
              : "Create a new subscription plan for retailers."}
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close"
          disabled={pending}
          onClick={() => changeOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#E6C66D] hover:bg-[#D6AA50]/15 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <form
          key={initial?._id || "new"}
          onSubmit={submit}
          noValidate
          className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2"
        >
          <Field
            name="planName"
            label="Plan Name"
            placeholder="e.g. Premium"
            required
            defaultValue={initial?.planName}
            error={errors.planName}
          />
          <Field
            name="price"
            label="Price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            defaultValue={initial?.price}
            error={errors.price}
          />
          <label className={`${labelClass} sm:col-span-2`}>
            <span>Billing Cycle *</span>
            <Select name="plan" defaultValue={initial?.plan || "monthly"}>
              <SelectTrigger className={`${inputClass} shadow-none focus:ring-0`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#CBA24A]/25 bg-[#4A2D1D] text-[#F7E4B3]">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <div className={`${labelClass} sm:col-span-2`}>
            <span>Features</span>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    name="features"
                    value={feature}
                    onChange={(event) =>
                      setFeatures((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                    placeholder={`Feature ${index + 1}`}
                    className={inputClass}
                  />
                  {index === features.length - 1 ? (
                    <button
                      type="button"
                      aria-label="Add another feature"
                      title="Add another feature"
                      onClick={() =>
                        setFeatures((current) => [...current, ""])
                      }
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#D6AA50] text-[#3A2417] transition-colors hover:bg-[#E7BF69]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Remove feature ${index + 1}`}
                      title="Remove feature"
                      onClick={() =>
                        setFeatures((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-red-500/35 text-red-400 transition-colors hover:bg-red-950/50"
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
              className="h-10 cursor-pointer rounded-md border border-[#D6AA50] text-xs text-[#F4D77B] hover:bg-[#D6AA50]/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-10 cursor-pointer rounded-md bg-[#D6AA50] text-xs font-semibold text-[#3A2417] hover:bg-[#E7BF69] disabled:opacity-50"
            >
              {pending
                ? "Saving..."
                : initial
                  ? "Save Changes"
                  : "Add Subscription"}
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
      {error && <span className="block text-red-400">{error}</span>}
    </label>
  );
}
