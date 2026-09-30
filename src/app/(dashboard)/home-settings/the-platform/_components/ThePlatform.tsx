"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Boxes, ImageIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlatformFeature {
  icon?: string;
  title?: string;
  description?: string;
}

interface PlatformItem {
  _id: string;
  image?: string;
  platformLabel?: string;
  title?: string;
  highlightedTitle?: string;
  description?: string;
  imageLabel?: string;
  imageTitle?: string;
  features?: PlatformFeature[];
}

interface ListResponse {
  success: boolean;
  message?: string;
  data?: PlatformItem;
}

interface ActionResponse {
  success: boolean;
  message?: string;
  data?: PlatformItem;
}

function apiBase() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

const emptyFeature = (): PlatformFeature => ({
  icon: "",
  title: "",
  description: "",
});

const PLATFORM_ID = "6a61b8121161ac986039d5e7";

export default function ThePlatform() {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<PlatformItem | null>(null);

  const platformQuery = useQuery({
    queryKey: ["retailer-platform", PLATFORM_ID],
    queryFn: async () => {
      const response = await fetch(
        `${apiBase()}/retailer-platform/${PLATFORM_ID}`,
      );
      const result = (await response.json().catch(() => null)) as
        | ListResponse
        | null;
      if (!response.ok || !result?.success || !result.data?._id) {
        throw new Error(result?.message || "Unable to load platform content.");
      }
      return result.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: FormData }) => {
      if (!token) throw new Error("Your session has expired.");
      const response = await fetch(`${apiBase()}/retailer-platform/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const result = (await response.json().catch(() => null)) as
        | ActionResponse
        | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update the platform.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: ["retailer-platform", PLATFORM_ID],
      });
      toast.success(result.message || "Platform updated successfully.");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Update failed."),
  });

  const platformItem = platformQuery.data;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-serif text-xl text-[#F7E4B3]">The Platform</h2>
        <p className="mt-1 text-xs text-[#9A8060]">
          Manage the platform overview, visual content and feature cards.
        </p>
      </header>

      {platformQuery.isLoading ? (
        <State text="Loading platform content..." />
      ) : platformQuery.isError ? (
        <State text={platformQuery.error.message} error />
      ) : !platformItem ? (
        <State text="No platform content was found." />
      ) : (
        <div className="space-y-6">
          {[platformItem].map((item) => (
            <article
              key={item._id}
              className="overflow-hidden rounded-2xl border border-[#CBA24A]/35 bg-[#2A1E10] shadow-[0_18px_55px_rgba(0,0,0,.22)]"
            >
              <div className="grid lg:grid-cols-[1fr_40%]">
                <div className="p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D6AA50]">
                        {item.platformLabel || "The Platform"}
                      </p>
                      <h3 className="mt-3 max-w-2xl font-serif text-2xl leading-tight text-[#F7E4B3]">
                        {item.title || "Platform title"}{" "}
                        <span className="text-[#D6AA50]">
                          {item.highlightedTitle}
                        </span>
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-[#D6AA50]/45 px-3 text-[11px] font-semibold text-[#F1C75B] hover:bg-[#D6AA50] hover:text-[#342315]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#BFA98A]">
                    {item.description || "No description added."}
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {item.features?.length ? (
                      item.features.map((feature, index) => (
                        <div
                          key={`${feature.title}-${index}`}
                          className="rounded-xl border border-[#CBA24A]/18 bg-[#382719]/55 p-4"
                        >
                          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#D6AA50]/15 text-[#D6AA50]">
                            <Boxes className="h-4 w-4" />
                          </div>
                          <h4 className="text-sm font-semibold text-[#F7E4B3]">
                            {feature.title || "Untitled feature"}
                          </h4>
                          <p className="mt-1.5 text-[11px] leading-5 text-[#AFA08B]">
                            {feature.description || "No description."}
                          </p>
                          {feature.icon && (
                            <p className="mt-2 text-[9px] uppercase tracking-wider text-[#806E58]">
                              Icon: {feature.icon}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#9A8060]">No features added.</p>
                    )}
                  </div>
                </div>

                <div className="relative min-h-[380px] bg-[#1B1009]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.imageTitle || "Platform"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#9A8060]">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-0 p-6">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D6AA50]">
                      {item.imageLabel}
                    </p>
                    <p className="mt-2 font-serif text-xl text-white">
                      {item.imageTitle}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <PlatformModal
        item={editing}
        pending={updateMutation.isPending}
        onClose={() => !updateMutation.isPending && setEditing(null)}
        onSubmit={(body) => {
          if (editing) updateMutation.mutate({ id: editing._id, body });
        }}
      />
    </div>
  );
}

function PlatformModal({
  item,
  pending,
  onClose,
  onSubmit,
}: {
  item: PlatformItem | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (body: FormData) => void;
}) {
  const [features, setFeatures] = useState<PlatformFeature[]>([emptyFeature()]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) setFeatures(item.features?.length ? item.features : [emptyFeature()]);
  }, [item]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const source = new FormData(event.currentTarget);
    const fields = [
      "platformLabel",
      "title",
      "highlightedTitle",
      "description",
      "imageLabel",
      "imageTitle",
    ] as const;
    const values = Object.fromEntries(
      fields.map((field) => [field, String(source.get(field) || "").trim()]),
    ) as Record<(typeof fields)[number], string>;
    if (fields.some((field) => !values[field])) {
      setError("Please complete all text fields.");
      return;
    }
    const cleanFeatures = features
      .map((feature) => ({
        icon: feature.icon?.trim() || "",
        title: feature.title?.trim() || "",
        description: feature.description?.trim() || "",
      }))
      .filter((feature) => feature.title || feature.description || feature.icon);
    const body = new FormData();
    fields.forEach((field) => body.append(field, values[field]));
    body.append("features", JSON.stringify(cleanFeatures));
    const image = source.get("image");
    if (image instanceof File && image.size) body.append("image", image);
    setError("");
    onSubmit(body);
  };

  const updateFeature = (
    index: number,
    key: keyof PlatformFeature,
    value: string,
  ) =>
    setFeatures((current) =>
      current.map((feature, itemIndex) =>
        itemIndex === index ? { ...feature, [key]: value } : feature,
      ),
    );

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="max-h-[94vh] w-[calc(100%-1.5rem)] max-w-[760px] gap-0 overflow-hidden rounded-xl border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl text-[#F1C75B]">
            Edit The Platform
          </DialogTitle>
          <DialogDescription className="text-xs text-[#BFA98A]">
            Update platform copy, image and feature cards.
          </DialogDescription>
        </DialogHeader>
        <button type="button" onClick={onClose} disabled={pending} className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center text-[#E6C66D]">
          <X className="h-5 w-5" />
        </button>
        <form key={item?._id} onSubmit={submit} className="max-h-[calc(94vh-76px)] space-y-4 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="platformLabel" label="Platform Label" defaultValue={item?.platformLabel} />
            <Field name="title" label="Title" defaultValue={item?.title} />
            <Field name="highlightedTitle" label="Highlighted Title" defaultValue={item?.highlightedTitle} />
            <Field name="imageLabel" label="Image Label" defaultValue={item?.imageLabel} />
            <Field name="imageTitle" label="Image Title" defaultValue={item?.imageTitle} className="sm:col-span-2" />
          </div>
          <label className={labelClass}>
            <span>Description *</span>
            <textarea name="description" defaultValue={item?.description} className={`${inputClass} h-24 resize-none py-2.5`} />
          </label>
          <label className={labelClass}>
            <span>Replace Image</span>
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full cursor-pointer rounded-md border border-[#A67C3D] bg-[#6A4833] p-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-[#D6AA50] file:px-3 file:py-2" />
          </label>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-[#F4D77B]">Platform Features</p>
              <p className="mt-1 text-[10px] text-[#BFA98A]">Add, edit or remove feature cards.</p>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="rounded-xl border border-[#A67C3D]/45 bg-[#3A2417]/55 p-3">
                <div className="grid gap-3 sm:grid-cols-[130px_1fr_40px]">
                  <input value={feature.icon || ""} onChange={(event) => updateFeature(index, "icon", event.target.value)} placeholder="Icon name" className={inputClass} />
                  <input value={feature.title || ""} onChange={(event) => updateFeature(index, "title", event.target.value)} placeholder={`Feature ${index + 1} title`} className={inputClass} />
                  {index === features.length - 1 ? (
                    <button type="button" aria-label="Add feature" onClick={() => setFeatures((current) => [...current, emptyFeature()])} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[#D6AA50] text-[#342315]"><Plus className="h-4 w-4" /></button>
                  ) : (
                    <button type="button" aria-label="Remove feature" onClick={() => setFeatures((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-red-500/35 text-red-400"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
                <textarea value={feature.description || ""} onChange={(event) => updateFeature(index, "description", event.target.value)} placeholder="Feature description" className={`${inputClass} mt-3 h-20 resize-none py-2.5`} />
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={pending} onClick={onClose} className="h-10 cursor-pointer rounded-md border border-[#D6AA50] text-xs text-[#F4D77B] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={pending} className="h-10 cursor-pointer rounded-md bg-[#D6AA50] text-xs font-semibold text-[#342315] disabled:opacity-50">{pending ? "Updating..." : "Save Changes"}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputClass = "h-10 w-full rounded-md border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none focus:border-[#D6AA50]";
const labelClass = "block space-y-1.5 text-xs font-medium text-[#F4D77B]";

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={`${labelClass} ${className}`}><span>{label} *</span><input {...props} className={inputClass} /></label>;
}

function State({ text, error }: { text: string; error?: boolean }) {
  return <div className={`rounded-xl border border-[#CBA24A]/30 bg-[#2A1E10] px-6 py-20 text-center text-sm ${error ? "text-red-400" : "text-[#9A8060]"}`}>{text}</div>;
}
