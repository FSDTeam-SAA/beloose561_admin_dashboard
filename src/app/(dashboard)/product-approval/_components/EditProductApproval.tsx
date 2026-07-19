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
  description: string;
  humidorId: string;
  shelfName: string;
  quantity: string;
  price: string;
  isStaffPick: boolean;
  staffPickNote: string;
  staffPickBy: string;
  isNewArrival: boolean;
  arrivalDate: string;
  isDailyFeatured: boolean;
  featuredNote: string;
  lowStockThreshold: string;
  status: string;
};

const emptyForm: FormState = {
  name: "",
  brand: "",
  strength: "medium",
  wrapper: "",
  size: "",
  description: "",
  humidorId: "",
  shelfName: "",
  quantity: "0",
  price: "0",
  isStaffPick: false,
  staffPickNote: "",
  staffPickBy: "",
  isNewArrival: false,
  arrivalDate: "",
  isDailyFeatured: false,
  featuredNote: "",
  lowStockThreshold: "5",
  status: "under_review",
};
const inputClass =
  "h-9 w-full rounded-md border border-transparent bg-[#62432F] px-3 text-xs text-[#F8E8C4] outline-none placeholder:text-[#C9B697]/70 transition focus:border-[#D6AA50]/70";

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
      description: item.description || "",
      humidorId: item.humidorId || "",
      shelfName: item.shelfName || "",
      quantity: String(item.quantity ?? 0),
      price: String(item.price ?? 0),
      isStaffPick: Boolean(item.isStaffPick),
      staffPickNote: item.staffPickNote || "",
      staffPickBy: item.staffPickBy || "",
      isNewArrival: Boolean(item.isNewArrival),
      arrivalDate: item.arrivalDate ? item.arrivalDate.slice(0, 10) : "",
      isDailyFeatured: Boolean(item.isDailyFeatured),
      featuredNote: item.featuredNote || "",
      lowStockThreshold: String(item.lowStockThreshold ?? 5),
      status: item.status || "under_review",
    });
    setImageFile(undefined);
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("Product not found.");
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "status") return;
        if (key === "arrivalDate" && !value) return;
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
      const statusResponse = await fetch(
        `${getApiBaseUrl()}/inventory/${product._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: form.status }),
        },
      );
      const statusResult = (await statusResponse
        .json()
        .catch(() => null)) as InventoryResponse | null;
      if (!statusResponse.ok || !statusResult?.success)
        throw new Error(
          statusResult?.message ||
            "Product updated, but status could not be changed.",
        );
      return statusResult;
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
  }> = [
    { key: "name", label: "Cigar Name" },
    { key: "brand", label: "Brand" },
    { key: "wrapper", label: "Wrapper" },
    { key: "size", label: "Size" },
    { key: "quantity", label: "Quantity", type: "number", min: "0" },
    {
      key: "price",
      label: "Price ($)",
      type: "number",
      min: "0",
      step: "0.01",
    },
    {
      key: "lowStockThreshold",
      label: "Low Stock Threshold",
      type: "number",
      min: "0",
    },
    { key: "staffPickBy", label: "Staff Pick By" },
    { key: "arrivalDate", label: "Arrival Date", type: "date" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="max-h-[92vh] w-[calc(100%-2rem)] !max-w-[850px] gap-0 overflow-y-auto rounded-xl border border-[#CBA24A]/15 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <DialogHeader className="px-5 pb-4 pt-5 sm:px-6">
          <DialogTitle className="pr-8 font-serif text-2xl font-semibold text-[#D6AA50]">
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
            className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-lg rounded-tr-xl bg-[#D6AA50] text-[#4A2D1D] hover:bg-[#E7BF69]"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        {!product ? (
          <p className="px-6 pb-12 pt-6 text-center text-sm text-red-300">
            Product not found.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {textFields.map((field) => (
                <label
                  key={field.key}
                  className="space-y-1.5 text-[11px] font-medium"
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
              <label className="space-y-1.5 text-[11px] font-medium">
                <span>Strength</span>
                <select
                key={form.name}
                  value={form.strength}
                  onChange={(event) => setValue("strength", event.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="full">Full</option>
                </select>
              </label>
              <label className="space-y-1.5 text-[11px] font-medium">
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
              <label className="space-y-1.5 text-[11px] font-medium">
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
              <label className="space-y-1.5 text-[11px] font-medium">
                <span>Status</span>
                <Select
                  value={form.status}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger
                    className={`${inputClass} w-full cursor-pointer capitalize`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="border-[#CBA24A]/30 bg-[#4A2D1D] text-[#F8E8C4]">
                    {["active", "under_review", "out_of_stock", "inactive"].map(
                      (status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="cursor-pointer capitalize focus:bg-[#62432F] focus:text-[#F8E8C4]"
                        >
                          {status.replaceAll("_", " ")}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </label>
            </div>
            <label className="block space-y-1.5 text-[11px] font-medium">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setValue("description", event.target.value)
                }
                rows={3}
                className={`${inputClass} h-auto py-2`}
              />
            </label>
            <label className="block space-y-1.5 text-[11px] font-medium">
              <span>Staff Pick Note</span>
              <input
                value={form.staffPickNote}
                onChange={(event) =>
                  setValue("staffPickNote", event.target.value)
                }
                className={inputClass}
              />
            </label>
            <label className="block space-y-1.5 text-[11px] font-medium">
              <span>Featured Note</span>
              <input
                value={form.featuredNote}
                onChange={(event) =>
                  setValue("featuredNote", event.target.value)
                }
                className={inputClass}
              />
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImage}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#D9C6A5]/80 text-[#D9C6A5] hover:border-[#D6AA50]"
            >
              <Upload className="h-5 w-5" />
              <span className="text-[11px]">
                {imageFile?.name || "Choose a new image (optional)"}
              </span>
            </button>
            <div className="flex flex-wrap gap-4 text-[11px]">
              {(
                ["isStaffPick", "isNewArrival", "isDailyFeatured"] as const
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
                      isNewArrival: "New Arrival",
                      isDailyFeatured: "Daily Featured",
                    }[key]
                  }
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="h-9 cursor-pointer rounded border border-[#D6AA50] text-[11px] hover:bg-[#D6AA50]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-9 cursor-pointer rounded bg-[#D6AA50] text-[11px] font-semibold text-[#3A2417] hover:bg-[#E7BF69] disabled:cursor-not-allowed disabled:opacity-50"
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
