"use client";

import { useEffect, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ImageIcon, Pencil, X } from "lucide-react";
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

const BANNER_ID = "6a619e5eb1b1169766487138";

interface RetailerBanner {
  _id: string;
  banner?: string;
  title?: string;
  mainTitle?: string;
  discription?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BannerResponse {
  success: boolean;
  message?: string;
  data?: RetailerBanner;
}

type EditableSection = "banner" | "title" | "mainTitle" | "discription";

const sectionLabels: Record<EditableSection, string> = {
  banner: "Banner Image",
  title: "Title",
  mainTitle: "Main Title",
  discription: "Description",
};

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

export default function BannerUpdate() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<EditableSection | null>(null);

  const bannerQuery = useQuery({
    queryKey: ["retailer-banner", BANNER_ID],
    queryFn: async () => {
      const response = await fetch(
        `${getApiBaseUrl()}/retailer-banner/${BANNER_ID}`,
      );
      const result = (await response
        .json()
        .catch(() => null)) as BannerResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to load banner.");
      }
      return result.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(
        `${getApiBaseUrl()}/retailer-banner/${BANNER_ID}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as BannerResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update banner.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: ["retailer-banner", BANNER_ID],
      });
      toast.success(result.message || "Banner updated successfully.");
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to update banner.",
      ),
  });

  if (bannerQuery.isLoading || sessionStatus === "loading") {
    return <StateMessage text="Loading banner content..." />;
  }
  if (bannerQuery.isError) {
    return <StateMessage text={bannerQuery.error.message} error />;
  }

  const banner = bannerQuery.data;
  if (!banner) {
    return <StateMessage text="Banner content was not found." error />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-xl text-[#F7E4B3]">
          Homepage Banner
        </h2>
        <p className="mt-1 text-xs text-[#9A8060]">
          Review and update each part of the retailer homepage banner.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#CBA24A]/35 bg-[#2A1E10]">
        <div className="relative aspect-[16/6] min-h-[220px] w-full bg-[#1B1009]">
          {banner.banner ? (
            <Image
              src={banner.banner}
              alt="Retailer homepage banner"
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#9A8060]">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <EditButton
            label="Edit Banner Image"
            onClick={() => setEditing("banner")}
            className="absolute right-4 top-4"
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ContentCard
          label="Title"
          value={banner.title}
          onEdit={() => setEditing("title")}
        />
        <ContentCard
          label="Main Title"
          value={banner.mainTitle}
          onEdit={() => setEditing("mainTitle")}
          richText
        />
        <ContentCard
          label="Description"
          value={banner.discription}
          onEdit={() => setEditing("discription")}
          className="lg:col-span-2"
        />
      </div>

      <BannerEditModal
        section={editing}
        banner={banner}
        pending={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) setEditing(null);
        }}
        onSubmit={(formData) => updateMutation.mutate(formData)}
      />
    </div>
  );
}

function ContentCard({
  label,
  value,
  onEdit,
  className = "",
  richText = false,
}: {
  label: string;
  value?: string;
  onEdit: () => void;
  className?: string;
  richText?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-[#CBA24A]/30 bg-[#2A1E10] p-5 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D6AA50]">
          {label}
        </p>
        <EditButton label={`Edit ${label}`} onClick={onEdit} />
      </div>
      {richText && value ? (
        <div
          className="text-sm leading-6 text-[#E8D8BA] [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <p className="text-sm leading-6 text-[#E8D8BA]">
          {value || "No content added."}
        </p>
      )}
    </section>
  );
}

function EditButton({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#D6AA50]/45 bg-[#2A1E10]/90 px-3 text-[11px] font-semibold text-[#F1C75B] backdrop-blur-sm hover:bg-[#D6AA50] hover:text-[#342315] ${className}`}
    >
      <Pencil className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function BannerEditModal({
  section,
  banner,
  pending,
  onOpenChange,
  onSubmit,
}: {
  section: EditableSection | null;
  banner: RetailerBanner;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
}) {
  const [error, setError] = useState("");
  const [mainTitleValue, setMainTitleValue] = useState("");

  useEffect(() => {
    if (section === "mainTitle") {
      setMainTitleValue(banner.mainTitle || "");
    }
  }, [banner.mainTitle, section]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!section) return;
    const source = new FormData(event.currentTarget);
    const formData = new FormData();

    if (section === "banner") {
      const file = source.get("banner");
      if (!(file instanceof File) || file.size === 0) {
        setError("Please select a banner image.");
        return;
      }
      formData.append("banner", file);
    } else {
      const value =
        section === "mainTitle"
          ? mainTitleValue.trim()
          : String(source.get(section) || "").trim();
      const hasVisibleContent =
        section !== "mainTitle" ||
        value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
      if (!value || !hasVisibleContent) {
        setError(`${sectionLabels[section]} is required.`);
        return;
      }
      formData.append(section, value);
    }

    setError("");
    onSubmit(formData);
  };

  const currentValue = section && section !== "banner" ? banner[section] : "";

  return (
    <Dialog
      open={section !== null}
      onOpenChange={(open) => {
        if (!open) setError("");
        onOpenChange(open);
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="w-[calc(100%-1.5rem)] max-w-[570px] gap-0 overflow-visible rounded-xl border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl text-[#F1C75B]">
            Edit {section ? sectionLabels[section] : "Banner"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#BFA98A]">
            Save the change to update this homepage banner section.
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close"
          disabled={pending}
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#E6C66D] hover:bg-[#D6AA50]/15 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <form key={section} onSubmit={submit} className="space-y-4 p-5">
          {section === "banner" ? (
            <label className="block space-y-2 text-xs font-medium text-[#F4D77B]">
              <span>Banner Image *</span>
              <input
                name="banner"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="block w-full cursor-pointer rounded-md border border-[#A67C3D] bg-[#6A4833] p-2 text-xs text-[#F8E8C4] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-[#D6AA50] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#342315]"
              />
            </label>
          ) : section === "mainTitle" ? (
            <label className="block space-y-2 text-xs font-medium text-[#F4D77B]">
              <span>Main Title *</span>
              <div className="relative rounded-md border border-[#A67C3D] bg-[#3A2417] text-[#F8E8C4] [&_.ql-color-picker_.ql-picker-options]:w-[152px] [&_.ql-color-picker_.ql-picker-options]:grid-cols-5 [&_.ql-color-picker_.ql-picker-options]:gap-1 [&_.ql-color-picker_.ql-picker-options]:p-2 [&_.ql-color-picker.ql-expanded_.ql-picker-options]:grid [&_.ql-color-picker_.ql-picker-item]:m-0 [&_.ql-color-picker_.ql-picker-item]:h-5 [&_.ql-color-picker_.ql-picker-item]:w-5 [&_.ql-container]:min-h-32 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-32 [&_.ql-editor.ql-blank]:before]:text-[#B9AA9F]/60 [&_.ql-editor.ql-blank]:before]:not-italic [&_.ql-picker-label]:text-[#F8E8C4] [&_.ql-picker-options]:z-[100] [&_.ql-picker-options]:border-[#A67C3D] [&_.ql-picker-options]:bg-[#2A1E10] [&_.ql-picker-options]:shadow-xl [&_.ql-stroke]:stroke-[#F4D77B] [&_.ql-toolbar]:rounded-t-md [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-[#A67C3D]/60 [&_.ql-toolbar]:bg-[#4A2D1D]">
                <ReactQuill
                  theme="snow"
                  value={mainTitleValue}
                  onChange={setMainTitleValue}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter the main banner title..."
                />
              </div>
              <span className="block text-[10px] font-normal text-[#BFA98A]">
                Select any text, then use the color button in the toolbar.
              </span>
            </label>
          ) : section === "discription" ? (
            <label className="block space-y-2 text-xs font-medium text-[#F4D77B]">
              <span>{section ? sectionLabels[section] : ""} *</span>
              <textarea
                name={section || undefined}
                defaultValue={currentValue}
                className="h-32 w-full resize-none rounded-md border border-[#A67C3D] bg-[#6A4833] px-3 py-2.5 text-sm leading-6 text-[#F8E8C4] outline-none focus:border-[#D6AA50]"
              />
            </label>
          ) : (
            <label className="block space-y-2 text-xs font-medium text-[#F4D77B]">
              <span>Title *</span>
              <input
                name="title"
                defaultValue={currentValue}
                className="h-10 w-full rounded-md border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none focus:border-[#D6AA50]"
              />
            </label>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
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
              {pending ? "Updating..." : "Update"}
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
