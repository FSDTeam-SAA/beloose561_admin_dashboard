"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
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
import type { InventoryItem } from "./ViewProduct";

interface InventoryResponse {
  success: boolean;
  message?: string;
  data?: InventoryItem;
}
interface Humidor {
  _id: string;
  name: string;
  location?: string;
  shelfes?: Array<{ _id: string; name: string }>;
}
interface HumidorResponse {
  success: boolean;
  message?: string;
  data?: Humidor[] | Humidor;
}
interface EditProductApprovalProps {
  open: boolean;
  product: InventoryItem | null;
  accessToken?: string;
  onOpenChange: (open: boolean) => void;
}

type FormState = {
  name: string;
  brand: string;
  strength: string;
  wrapper: string;
  size: string;
  smokingTime: string;
  discoveryType: "familiar" | "new";
  description: string;
  pairingSuggestions: string;
  humidorId: string;
  shelfName: string;
  quantity: string;
  price: string;
  isStaffPick: boolean;
  isDailyFeatured: boolean;
  lowStockThreshold: string;
};

const emptyForm: FormState = {
  name: "",
  brand: "",
  strength: "medium",
  wrapper: "",
  size: "",
  smokingTime: "",
  discoveryType: "familiar",
  description: "",
  pairingSuggestions: "",
  humidorId: "",
  shelfName: "",
  quantity: "0",
  price: "0",
  isStaffPick: false,
  isDailyFeatured: false,
  lowStockThreshold: "5",
};
const inputClass =
  "h-10 w-full rounded-[4px] border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none placeholder:text-[#B9AA9F]/65 transition focus:border-[#D6AA50] focus:ring-1 focus:ring-[#D6AA50]/30";

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function EditProductApproval({
  open,
  product,
  accessToken,
  onOpenChange,
}: EditProductApprovalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const humidorsQuery = useQuery({
    queryKey: ["inventory-humidor", product?.humidorId],
    enabled: open && Boolean(product?.humidorId),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/humidor/${product!.humidorId}`);
      const result = (await response.json().catch(() => null)) as HumidorResponse | Humidor | null;
      if (!response.ok || !result) throw new Error("Unable to load humidor.");
      if ("success" in result) {
        const data = result.data;
        const humidor = Array.isArray(data) ? data[0] : data;
        if (!humidor) throw new Error(result.message || "Humidor not found.");
        return [humidor];
      }
      return [result];
    },
  });

  useEffect(() => {
    const item = product;
    if (!item) return;
    setForm({
      name: item.name || "",
      brand: item.brand || "",
      strength: item.strength || "medium",
      wrapper: item.wrapper || "",
      size: item.size || "",
      smokingTime: item.smokingTime || "",
      discoveryType: item.masterCigarId ? "familiar" : "new",
      description: item.description || "",
      pairingSuggestions: item.pairingSuggestions?.join(", ") || "",
      humidorId: item.humidorId || "",
      shelfName: item.shelfName || "",
      quantity: String(item.quantity ?? 0),
      price: String(item.price ?? 0),
      isStaffPick: Boolean(item.isStaffPick),
      isDailyFeatured: Boolean(item.isDailyFeatured),
      lowStockThreshold: String(item.lowStockThreshold ?? 5),
    });
    setImageFile(undefined);
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("Product not found.");
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "discoveryType") return;
        if (key === "pairingSuggestions" && !value) return;
        body.append(key, String(value));
      });
      if (imageFile) body.append("image", imageFile, imageFile.name);
      const response = await fetch(
        `${getApiBaseUrl()}/inventory/${product._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as InventoryResponse | null;
      if (!response.ok || !result?.success)
        throw new Error(result?.message || "Unable to update product.");
      return result;
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Inventory updated successfully.");
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await queryClient.invalidateQueries({
        queryKey: ["inventory-details", product?._id],
      });
      onOpenChange(false);
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to update product.",
      ),
  });

  const setValue = (key: keyof FormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateMutation.mutate();
  };
  const handleImage = (event: ChangeEvent<HTMLInputElement>) =>
    setImageFile(event.target.files?.[0]);

  const textFields: Array<{
    key: keyof FormState;
    label: string;
    type?: string;
    min?: string;
    step?: string;
    orderClass: string;
  }> = [
    { key: "name", label: "Cigar Name", orderClass: "order-1" },
    { key: "brand", label: "Brand", orderClass: "order-2" },
    { key: "size", label: "Size", orderClass: "order-5" },
    { key: "quantity", label: "Quantity", type: "number", min: "0", orderClass: "order-10" },
    {
      key: "price",
      label: "Retail Price",
      type: "number",
      min: "0",
      step: "0.01",
      orderClass: "order-11",
    },
    {
      key: "lowStockThreshold",
      label: "Minimum Stock",
      type: "number",
      min: "0",
      orderClass: "order-12",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="max-h-[92vh] w-[calc(100%-1.5rem)] !max-w-[570px] gap-0 overflow-y-auto rounded-lg border border-[#A67C3D]/70 bg-[#5A351F] p-0 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="pr-8 font-serif text-xl font-semibold text-[#F1C75B]">
            Edit Product
          </DialogTitle>
          <DialogDescription className="sr-only">
            Edit inventory product
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close edit product"
            className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#E6C66D] hover:bg-[#D6AA50]/15"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        {!product ? (
          <p className="px-6 pb-12 pt-6 text-center text-sm text-red-300">
            Product not found.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
            <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
              {textFields.map((field) => (
                <label
                  key={field.key}
                  className={`${field.orderClass} space-y-1.5 text-xs font-medium text-[#F4D77B]`}
                >
                  <span>{field.label}</span>
                  <input
                    required={[
                      "name",
                      "humidorId",
                      "shelfName",
                      "quantity",
                      "price",
                    ].includes(field.key)}
                    type={field.type || "text"}
                    min={field.min}
                    step={field.step}
                    value={String(form[field.key])}
                    onChange={(event) =>
                      setValue(field.key, event.target.value)
                    }
                    className={inputClass}
                  />
                </label>
              ))}
              <label className="order-3 space-y-1.5 text-xs font-medium text-[#F4D77B]">
                <span>Strength *</span>
                <select
                key={form.name}
                  value={form.strength}
                  onChange={(event) => setValue("strength", event.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="medium-full">Medium-Full</option>
                  <option value="full">Full</option>
                </select>
              </label>
              <label className="order-4 space-y-1.5 text-xs font-medium text-[#F4D77B]">
                <span>Wrapper *</span>
                <Select
                  value={form.wrapper}
                  onValueChange={(value) => setValue("wrapper", value)}
                >
                  <SelectTrigger className={`${inputClass} w-full cursor-pointer`}>
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent className="border-[#CBA24A]/30 bg-[#4A2D1D] text-[#F8E8C4]">
                    {["Habano", "Connecticut", "Maduro", "Corojo", "Natural", "Cameroon"].map((wrapper) => (
                      <SelectItem key={wrapper} value={wrapper} className="cursor-pointer focus:bg-[#62432F] focus:text-[#F8E8C4]">
                        {wrapper}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="order-6 space-y-1.5 text-xs font-medium text-[#F4D77B]">
                <span>Smoking Time *</span>
                <Select
                  value={form.smokingTime}
                  onValueChange={(value) => setValue("smokingTime", value)}
                >
                  <SelectTrigger className={`${inputClass} w-full cursor-pointer`}>
                    <SelectValue placeholder="Select smoking time" />
                  </SelectTrigger>
                  <SelectContent className="border-[#CBA24A]/30 bg-[#4A2D1D] text-[#F8E8C4]">
                    {["30", "60", "90", "120+"].map((time) => (
                      <SelectItem key={time} value={time} className="cursor-pointer focus:bg-[#62432F] focus:text-[#F8E8C4]">
                        {time === "120+" ? "120+ minutes" : `${time} minutes`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="order-7 space-y-1.5 text-xs font-medium text-[#F4D77B]">
                <span>Discovery Type *</span>
                <Select
                  value={form.discoveryType}
                  onValueChange={(value) =>
                    setValue("discoveryType", value as "familiar" | "new")
                  }
                >
                  <SelectTrigger className={`${inputClass} w-full cursor-pointer`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#CBA24A]/30 bg-[#4A2D1D] text-[#F8E8C4]">
                    <SelectItem value="familiar">Something Familiar</SelectItem>
                    <SelectItem value="new">Something New</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="order-8 space-y-1.5 text-xs font-medium text-[#F4D77B]">
                <span>Humidor</span>
                <Select
                  value={form.humidorId}
                  onValueChange={(value) => {
                    setValue("humidorId", value);
                    setValue("shelfName", "");
                  }}
                  disabled={humidorsQuery.isLoading}
                >
                  <SelectTrigger
                    className={`${inputClass} w-full cursor-pointer`}
                  >
                    <SelectValue
                      placeholder={
                        humidorsQuery.isLoading
                          ? "Loading humidors..."
                          : "Select humidor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="border-[#CBA24A]/30 bg-[#4A2D1D] text-[#F8E8C4]">
                    {humidorsQuery.data?.map((humidor) => (
                      <SelectItem
                        key={humidor._id}
                        value={humidor._id}
                        className="cursor-pointer focus:bg-[#62432F] focus:text-[#F8E8C4]"
                      >
                        {humidor.name}
                        {humidor.location ? ` — ${humidor.location}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {humidorsQuery.isError && (
                  <span className="block text-red-300">
                    {humidorsQuery.error.message}
                  </span>
                )}
              </label>
              <label className="order-9 space-y-1.5 text-xs font-medium text-[#F4D77B]">
                <span>Shelf</span>
                <Select
                  value={form.shelfName}
                  onValueChange={(value) => setValue("shelfName", value)}
                  disabled={!form.humidorId}
                >
                  <SelectTrigger
                    className={`${inputClass} w-full cursor-pointer`}
                  >
                    <SelectValue placeholder="Select shelf" />
                  </SelectTrigger>
                  <SelectContent className="border-[#CBA24A]/30 bg-[#4A2D1D] text-[#F8E8C4]">
                    {humidorsQuery.data
                      ?.find((humidor) => humidor._id === form.humidorId)
                      ?.shelfes?.map((shelf) => (
                        <SelectItem
                          key={shelf._id}
                          value={shelf.name}
                          className="cursor-pointer focus:bg-[#62432F] focus:text-[#F8E8C4]"
                        >
                          {shelf.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
            <label className="block space-y-1.5 text-xs font-medium text-[#F4D77B]">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setValue("description", event.target.value)
                }
                rows={4}
                className={`${inputClass} h-20 resize-none py-2`}
              />
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-[#F4D77B]">
              <span>Pairing Suggestions</span>
              <input
                value={form.pairingSuggestions}
                onChange={(event) =>
                  setValue("pairingSuggestions", event.target.value)
                }
                placeholder="Choose a pairing"
                className={inputClass}
              />
              <span className="block text-[10px] font-normal text-[#CDB37A]">
                Choose one or more. Separate pairings with commas.
              </span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImage}
              className="hidden"
            />
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[#F4D77B]">Image</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-20 w-full cursor-pointer items-center gap-3 rounded-[4px] border border-[#A67C3D] bg-[#6A4833]/55 p-2 text-left"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-[#3E290F] text-[#D6AA50]">
                  <Upload className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="inline-flex rounded bg-[#E4AD33] px-4 py-2 text-xs font-semibold text-[#3A2417]">
                    Choose image
                  </span>
                  <span className="mt-2 block truncate text-[10px] text-[#CDB37A]">
                    {imageFile?.name || "Large images are optimized automatically before upload."}
                  </span>
                </span>
              </button>
            </div>
            <div className="rounded-[4px] border border-[#A67C3D] bg-[#2E1B0D] p-3">
              <p className="mb-3 text-[11px] font-semibold text-[#E4AD33]">
                Optional customer features
              </p>
              <div className="flex flex-wrap gap-5 text-[11px] text-[#F4D77B]">
              {(
                ["isStaffPick", "isDailyFeatured"] as const
              ).map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(event) => setValue(key, event.target.checked)}
                    className="h-4 w-4 accent-[#D6AA50]"
                  />
                  {
                    {
                      isStaffPick: "Staff Pick",
                      isDailyFeatured: "Daily Featured",
                    }[key]
                  }
                </label>
              ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="h-10 cursor-pointer rounded border border-[#D6AA50] text-xs text-[#F4D77B] hover:bg-[#D6AA50]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-10 cursor-pointer rounded bg-[#D6AA50] text-xs font-semibold text-[#3A2417] hover:bg-[#E7BF69] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
