"use client";

import { useEffect, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Check, ImageIcon, Pencil, Plus, Trash2, X } from "lucide-react";
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

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [
      {
        color: [
          "#F7E4B3",
          "#F1C75B",
          "#D6AA50",
          "#ffffff",
          "#ef4444",
          "#f97316",
          "#eab308",
          "#22c55e",
          "#14b8a6",
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
          "#000000",
        ],
      },
    ],
    ["clean"],
  ],
};

const quillFormats = ["bold", "italic", "underline", "color"];

interface RetailerAbout {
  _id: string;
  image?: string;
  title?: string;
  description?: string;
  features?: string[];
}

interface ListResponse {
  success: boolean;
  message?: string;
  data?: RetailerAbout;
}

interface ActionResponse {
  success: boolean;
  message?: string;
  data?: RetailerAbout;
}

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

const RETAILER_ABOUT_ID = "6a697f8ae0394fc569a65e6f";

export default function ForRetailers() {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<RetailerAbout | null>(null);

  const aboutQuery = useQuery({
    queryKey: ["retailer-about", RETAILER_ABOUT_ID],
    queryFn: async () => {
      const response = await fetch(
        `${getApiBaseUrl()}/retailer-about/${RETAILER_ABOUT_ID}`,
      );
      const result = (await response
        .json()
        .catch(() => null)) as ListResponse | null;
      const item = result?.data;
      if (!response.ok || !result?.success || !item?._id) {
        throw new Error(result?.message || "Unable to load retailer content.");
      }
      return item;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      if (!accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(
        `${getApiBaseUrl()}/retailer-about/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as ActionResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update this section.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: ["retailer-about", RETAILER_ABOUT_ID],
      });
      toast.success(result.message || "Retailer section updated successfully.");
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to update section.",
      ),
  });
  const aboutItem = aboutQuery.data;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-xl text-[#F7E4B3]">
          For Retailers
        </h2>
        <p className="mt-1 text-xs text-[#9A8060]">
          Manage the retailer-focused content shown on the homepage.
        </p>
      </div>

      {aboutQuery.isLoading ? (
        <StateMessage text="Loading retailer content..." />
      ) : aboutQuery.isError ? (
        <StateMessage text={aboutQuery.error.message} error />
      ) : !aboutItem ? (
        <StateMessage text="No retailer content was found." />
      ) : (
        <div className="space-y-5">
          {[aboutItem].map((item) => (
            <article
              key={item._id}
              className="overflow-hidden rounded-2xl border border-[#CBA24A]/35 bg-[#2A1E10] shadow-[0_18px_55px_rgba(0,0,0,.18)]"
            >
              <div className="grid lg:grid-cols-[42%_1fr]">
                <div className="relative min-h-[280px] bg-[#1B1009]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || "For retailers"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-[280px] items-center justify-center text-[#9A8060]">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="flex flex-col p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D6AA50]">
                        Retailer Homepage Section
                      </p>
                      <h3 className="mt-2 font-serif text-2xl leading-tight text-[#F7E4B3]">
                        {item.title ? (
                          <span
                            className="[&_p]:m-0"
                            dangerouslySetInnerHTML={{ __html: item.title }}
                          />
                        ) : (
                          "Untitled retailer section"
                        )}
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

                  <p className="mt-4 text-sm leading-6 text-[#BFA98A]">
                    {item.description || "No description added."}
                  </p>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {item.features?.length ? (
                      item.features.map((feature, index) => (
                        <div
                          key={`${feature}-${index}`}
                          className="flex items-start gap-2 rounded-lg border border-[#CBA24A]/15 bg-[#382719]/55 px-3 py-2.5"
                        >
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          <span className="text-xs leading-4 text-[#E8D8BA]">
                            {feature}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#9A8060]">
                        No features added.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <RetailerAboutModal
        item={editing}
        pending={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) setEditing(null);
        }}
        onSubmit={(formData) => {
          if (editing) {
            updateMutation.mutate({ id: editing._id, formData });
          }
        }}
      />
    </div>
  );
}

function RetailerAboutModal({
  item,
  pending,
  onOpenChange,
  onSubmit,
}: {
  item: RetailerAbout | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
}) {
  const [features, setFeatures] = useState<string[]>([""]);
  const [titleValue, setTitleValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setTitleValue(item.title || "");
      setFeatures(item.features?.length ? item.features : [""]);
    }
  }, [item]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const source = new FormData(event.currentTarget);
    const title = titleValue.trim();
    const description = String(source.get("description") || "").trim();
    const cleanFeatures = features.map((feature) => feature.trim()).filter(Boolean);
    const hasTitle = title
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!hasTitle || !description) {
      setError("Title and description are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    cleanFeatures.forEach((feature, index) =>
      formData.append(`features[${index}]`, feature),
    );
    const image = source.get("image");
    if (image instanceof File && image.size > 0) {
      formData.append("image", image);
    }
    setError("");
    onSubmit(formData);
  };

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-[620px] gap-0 overflow-hidden rounded-xl border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl text-[#F1C75B]">
            Edit For Retailers
          </DialogTitle>
          <DialogDescription className="text-xs text-[#BFA98A]">
            Update the image, content and feature list for this section.
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close"
          disabled={pending}
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#E6C66D] hover:bg-[#D6AA50]/15"
        >
          <X className="h-5 w-5" />
        </button>

        <form
          key={item?._id}
          onSubmit={submit}
          className="max-h-[calc(92vh-76px)] space-y-4 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <label className="block space-y-1.5 text-xs font-medium text-[#F4D77B]">
            <span>Title *</span>
            <div className="relative rounded-md border border-[#A67C3D] bg-[#3A2417] text-[#F8E8C4] [&_.ql-color-picker_.ql-picker-options]:w-[152px] [&_.ql-color-picker_.ql-picker-options]:grid-cols-5 [&_.ql-color-picker_.ql-picker-options]:gap-1 [&_.ql-color-picker_.ql-picker-options]:p-2 [&_.ql-color-picker.ql-expanded_.ql-picker-options]:grid [&_.ql-container]:min-h-28 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-28 [&_.ql-picker-options]:z-[100] [&_.ql-picker-options]:border-[#A67C3D] [&_.ql-picker-options]:bg-[#2A1E10] [&_.ql-stroke]:stroke-[#F4D77B] [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-[#A67C3D]/60 [&_.ql-toolbar]:bg-[#4A2D1D]">
              <ReactQuill
                theme="snow"
                value={titleValue}
                onChange={setTitleValue}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Enter the retailer section title..."
              />
            </div>
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-[#F4D77B]">
            <span>Description *</span>
            <textarea
              name="description"
              defaultValue={item?.description}
              className="h-28 w-full resize-none rounded-md border border-[#A67C3D] bg-[#6A4833] px-3 py-2.5 text-sm leading-5 text-[#F8E8C4] outline-none focus:border-[#D6AA50]"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-[#F4D77B]">
            <span>Replace Image</span>
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full cursor-pointer rounded-md border border-[#A67C3D] bg-[#6A4833] p-2 text-xs text-[#F8E8C4] file:mr-3 file:rounded file:border-0 file:bg-[#D6AA50] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#342315]"
            />
          </label>

          <div className="space-y-2 text-xs font-medium text-[#F4D77B]">
            <span>Features</span>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={feature}
                  onChange={(event) =>
                    setFeatures((current) =>
                      current.map((value, itemIndex) =>
                        itemIndex === index ? event.target.value : value,
                      ),
                    )
                  }
                  placeholder={`Feature ${index + 1}`}
                  className="h-10 w-full rounded-md border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none focus:border-[#D6AA50]"
                />
                {index === features.length - 1 ? (
                  <button
                    type="button"
                    aria-label="Add another feature"
                    onClick={() => setFeatures((current) => [...current, ""])}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#D6AA50] text-[#342315] hover:bg-[#E7BF69]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove feature ${index + 1}`}
                    onClick={() =>
                      setFeatures((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-red-500/35 text-red-400 hover:bg-red-950/50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              disabled={pending}
              onClick={() => onOpenChange(false)}
              className="h-10 cursor-pointer rounded-md border border-[#D6AA50] text-xs text-[#F4D77B] hover:bg-[#D6AA50]/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-10 cursor-pointer rounded-md bg-[#D6AA50] text-xs font-semibold text-[#342315] hover:bg-[#E7BF69] disabled:opacity-50"
            >
              {pending ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StateMessage({ text, error }: { text: string; error?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-[#CBA24A]/30 bg-[#2A1E10] px-6 py-20 text-center text-sm ${
        error ? "text-red-400" : "text-[#9A8060]"
      }`}
    >
      {text}
    </div>
  );
}
