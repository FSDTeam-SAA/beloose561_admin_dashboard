"use client";

import { useState, type FormEvent } from "react";
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

interface HowItWorksItem {
  _id: string;
  image?: string;
  title?: string;
  description?: string;
}

interface ListResponse {
  success: boolean;
  message?: string;
  data?: HowItWorksItem;
}

interface ActionResponse {
  success: boolean;
  message?: string;
  data?: HowItWorksItem;
}

function apiBase() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

const HOW_IT_WORKS_ID = "6a6982ccc031049ba407fefc";

export default function HowItWorks() {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<HowItWorksItem | null>(null);

  const itemsQuery = useQuery({
    queryKey: ["retailer-howitwork", HOW_IT_WORKS_ID],
    queryFn: async () => {
      const response = await fetch(
        `${apiBase()}/retailer-howitwork/${HOW_IT_WORKS_ID}`,
      );
      const result = (await response.json().catch(() => null)) as
        | ListResponse
        | null;
      if (!response.ok || !result?.success || !result.data?._id) {
        throw new Error(result?.message || "Unable to load How It Works.");
      }
      return result.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: FormData;
    }) => {
      if (!token) throw new Error("Your session has expired.");
      const response = await fetch(
        `${apiBase()}/retailer-howitwork/${id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body,
        },
      );
      const result = (await response.json().catch(() => null)) as
        | ActionResponse
        | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update this step.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: ["retailer-howitwork", HOW_IT_WORKS_ID],
      });
      toast.success(result.message || "Step updated successfully.");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Update failed."),
  });

  const howItWorksItem = itemsQuery.data;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-serif text-xl text-[#F7E4B3]">How It Works</h2>
        <p className="mt-1 text-xs text-[#9A8060]">
          Manage the steps that explain how the retailer experience works.
        </p>
      </header>

      {itemsQuery.isLoading ? (
        <State text="Loading How It Works..." />
      ) : itemsQuery.isError ? (
        <State text={itemsQuery.error.message} error />
      ) : !howItWorksItem ? (
        <State text="No How It Works content was found." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[howItWorksItem].map((item, index) => (
            <article
              key={item._id}
              className="group overflow-hidden rounded-2xl border border-[#CBA24A]/30 bg-[#2A1E10] shadow-[0_16px_45px_rgba(0,0,0,.2)]"
            >
              <div className="relative h-52 bg-[#1B1009]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title || `Step ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#9A8060]">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1009]/80 to-transparent" />
                <span className="absolute bottom-3 left-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#D6AA50]/50 bg-[#2A1E10]/90 font-serif text-sm text-[#F1C75B]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-lg leading-6 text-[#F7E4B3]">
                    {item.title || "Untitled step"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-[#D6AA50]/40 px-2.5 text-[10px] font-semibold text-[#F1C75B] hover:bg-[#D6AA50] hover:text-[#342315]"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#BFA98A]">
                  {item.description || "No description added."}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <EditModal
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

function EditModal({
  item,
  pending,
  onClose,
  onSubmit,
}: {
  item: HowItWorksItem | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (body: FormData) => void;
}) {
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const source = new FormData(event.currentTarget);
    const title = String(source.get("title") || "").trim();
    const description = String(source.get("description") || "").trim();
    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }
    const body = new FormData();
    body.append("title", title);
    body.append("description", description);
    const image = source.get("image");
    if (image instanceof File && image.size) body.append("image", image);
    setError("");
    onSubmit(body);
  };

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="w-[calc(100%-1.5rem)] max-w-[570px] gap-0 overflow-hidden rounded-xl border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl text-[#F1C75B]">
            Edit How It Works
          </DialogTitle>
          <DialogDescription className="text-xs text-[#BFA98A]">
            Update this step&apos;s content and optional image.
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center text-[#E6C66D]"
        >
          <X className="h-5 w-5" />
        </button>
        <form key={item?._id} onSubmit={submit} className="space-y-4 p-5">
          <Field name="title" label="Title" defaultValue={item?.title} />
          <label className={labelClass}>
            <span>Description *</span>
            <textarea
              name="description"
              defaultValue={item?.description}
              className={`${inputClass} h-28 resize-none py-2.5`}
            />
          </label>
          <label className={labelClass}>
            <span>Replace Image</span>
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full cursor-pointer rounded-md border border-[#A67C3D] bg-[#6A4833] p-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-[#D6AA50] file:px-3 file:py-2"
            />
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Actions pending={pending} onCancel={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputClass =
  "h-10 w-full rounded-md border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none focus:border-[#D6AA50]";
const labelClass = "block space-y-1.5 text-xs font-medium text-[#F4D77B]";

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className={labelClass}>
      <span>{label} *</span>
      <input {...inputProps} className={inputClass} />
    </label>
  );
}

function Actions({ pending, onCancel }: { pending: boolean; onCancel: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" disabled={pending} onClick={onCancel} className="h-10 cursor-pointer rounded-md border border-[#D6AA50] text-xs text-[#F4D77B] disabled:opacity-50">Cancel</button>
      <button type="submit" disabled={pending} className="h-10 cursor-pointer rounded-md bg-[#D6AA50] text-xs font-semibold text-[#342315] disabled:opacity-50">{pending ? "Updating..." : "Save Changes"}</button>
    </div>
  );
}

function State({ text, error }: { text: string; error?: boolean }) {
  return <div className={`rounded-xl border border-[#CBA24A]/30 bg-[#2A1E10] px-6 py-20 text-center text-sm ${error ? "text-red-400" : "text-[#9A8060]"}`}>{text}</div>;
}
