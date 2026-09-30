"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
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
import DeleteModal from "@/components/deleteModal/DeleteModal";

interface HowItWorksItem {
  _id: string;
  image?: string;
  title?: string;
  description?: string;
}

interface ListResponse {
  success: boolean;
  message?: string;
  data?: HowItWorksItem[];
}

interface ActionResponse {
  success: boolean;
  message?: string;
  data?: HowItWorksItem;
}

interface HowItWorksTitle {
  _id: string;
  title?: string;
}

interface TitleListResponse {
  success?: boolean;
  message?: string;
  data?: HowItWorksTitle[];
}

interface TitleActionResponse {
  success?: boolean;
  message?: string;
  data?: HowItWorksTitle;
}

function apiBase() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

export default function HowItWorks() {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HowItWorksItem | null>(null);
  const [deleting, setDeleting] = useState<HowItWorksItem | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  const titleQuery = useQuery({
    queryKey: ["retailer-howitwork-title"],
    queryFn: async () => {
      const params = new URLSearchParams({ page: "1", limit: "1", sortBy: "createdAt", sortOrder: "desc" });
      const response = await fetch(`${apiBase()}/retailer-howitwork-title?${params}`);
      const result = (await response.json().catch(() => null)) as TitleListResponse | null;
      if (!response.ok || !Array.isArray(result?.data)) {
        throw new Error(result?.message || "Unable to load the section title.");
      }
      return result.data[0] ?? null;
    },
  });

  const titleMutation = useMutation({
    mutationFn: async ({ id, title }: { id?: string; title: string }) => {
      if (!token) throw new Error("Your session has expired.");
      const response = await fetch(id ? `${apiBase()}/retailer-howitwork-title/${id}` : `${apiBase()}/retailer-howitwork-title`, {
        method: id ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const result = (await response.json().catch(() => null)) as TitleActionResponse | null;
      if (!response.ok || !result) throw new Error(result?.message || "Unable to save the section title.");
      return result;
    },
    onSuccess: async (result) => {
      setEditingTitle(false);
      await queryClient.invalidateQueries({ queryKey: ["retailer-howitwork-title"] });
      toast.success(result.message || "Section title updated successfully.");
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Title update failed."),
  });

  const itemsQuery = useQuery({
    queryKey: ["retailer-howitwork"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        sortBy: "createdAt",
        sortOrder: "asc",
      });
      const response = await fetch(
        `${apiBase()}/retailer-howitwork?${params}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      const result = (await response.json().catch(() => null)) as
        | ListResponse
        | null;
      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "Unable to load How It Works steps.");
      }
      return result.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: string;
      body: FormData;
    }) => {
      if (!token) throw new Error("Your session has expired.");
      const response = await fetch(
        id ? `${apiBase()}/retailer-howitwork/${id}` : `${apiBase()}/retailer-howitwork`,
        {
          method: id ? "PATCH" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        },
      );
      const result = (await response.json().catch(() => null)) as
        | ActionResponse
        | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to save this step.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setModalOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: ["retailer-howitwork"],
      });
      toast.success(result.message || "Step saved successfully.");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Save failed."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Your session has expired.");
      const response = await fetch(`${apiBase()}/retailer-howitwork/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = (await response.json().catch(() => null)) as
        | ActionResponse
        | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to delete this step.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setDeleting(null);
      await queryClient.invalidateQueries({
        queryKey: ["retailer-howitwork"],
      });
      toast.success(result.message || "Step deleted successfully.");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Delete failed."),
  });

  const steps = itemsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-[#F7E4B3]">How It Works</h2>
          <p className="mt-1 text-xs text-[#9A8060]">
            Manage the steps that explain how the retailer experience works.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#D6AA50] px-4 text-xs font-semibold text-[#342315] hover:bg-[#E7BF69]"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </button>
      </header>

      <section className="rounded-2xl border border-[#CBA24A]/30 bg-[#2A1E10] p-5 shadow-[0_16px_45px_rgba(0,0,0,.16)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#D6AA50]">Section heading</p>
            <h3 className="mt-1 font-serif text-lg text-[#F7E4B3]">How It Works Title</h3>
            <p className="mt-1 text-xs text-[#9A8060]">This heading appears above the three steps on the homepage.</p>
          </div>
          {!editingTitle && !titleQuery.isLoading && <button type="button" onClick={() => { setTitleDraft(titleQuery.data?.title || ""); setEditingTitle(true); }} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#D6AA50]/45 px-3 text-[11px] font-semibold text-[#F1C75B] hover:bg-[#D6AA50] hover:text-[#342315]"><Pencil className="h-3.5 w-3.5" /> Edit title</button>}
        </div>
        {titleQuery.isLoading ? <div className="mt-5 flex items-center gap-2 text-xs text-[#9A8060]"><Loader2 className="h-4 w-4 animate-spin" /> Loading title...</div> : titleQuery.isError ? <p className="mt-5 text-xs text-red-400">{titleQuery.error.message}</p> : editingTitle ? <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const title = titleDraft.trim(); if (!title) return toast.error("Section title is required."); titleMutation.mutate({ id: titleQuery.data?._id, title }); }}><input autoFocus value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} placeholder="Enter the homepage section title" className={`${inputClass} flex-1`} /><div className="flex gap-2"><button type="button" disabled={titleMutation.isPending} onClick={() => setEditingTitle(false)} className="h-10 cursor-pointer rounded-md border border-[#CBA24A]/30 px-4 text-xs text-[#BFA98A] disabled:cursor-not-allowed disabled:opacity-60">Cancel</button><button disabled={titleMutation.isPending} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#D6AA50] px-4 text-xs font-semibold text-[#342315] disabled:cursor-not-allowed disabled:opacity-60">{titleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save title</button></div></form> : <p className="mt-5 font-serif text-2xl text-[#F7E4B3]">{titleQuery.data?.title || "No section title has been added yet."}</p>}
      </section>

      {itemsQuery.isLoading ? (
        <State text="Loading How It Works steps..." />
      ) : itemsQuery.isError ? (
        <State text={itemsQuery.error.message} error />
      ) : steps.length === 0 ? (
        <State text="No steps found. Add your first step to get started." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((item, index) => (
            <article
              key={item._id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#CBA24A]/30 bg-[#2A1E10] shadow-[0_16px_45px_rgba(0,0,0,.2)]"
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
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-lg leading-6 text-[#F7E4B3]">
                    {item.title || "Untitled step"}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      aria-label={`Edit ${item.title || "step"}`}
                      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-[#D6AA50]/40 px-2.5 text-[10px] font-semibold text-[#F1C75B] hover:bg-[#D6AA50] hover:text-[#342315]"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(item)}
                      aria-label={`Delete ${item.title || "step"}`}
                      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-red-500/35 px-2.5 text-[10px] font-semibold text-red-400 hover:bg-red-950/60"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#BFA98A]">
                  {item.description || "No description added."}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <StepModal
        open={modalOpen}
        item={editing}
        pending={saveMutation.isPending}
        onClose={() => {
          if (!saveMutation.isPending) {
            setModalOpen(false);
            setEditing(null);
          }
        }}
        onSubmit={(body) => {
          if (editing) {
            saveMutation.mutate({ id: editing._id, body });
          } else {
            saveMutation.mutate({ body });
          }
        }}
      />
      <DeleteModal
        open={deleting !== null}
        title="Delete Step"
        itemName={deleting?.title}
        description={
          deleting
            ? `Are you sure you want to delete “${
                deleting.title || "this step"
              }”? This action cannot be undone.`
            : undefined
        }
        disabled={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting._id);
        }}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleting(null);
        }}
      />
    </div>
  );
}

function StepModal({
  open,
  item,
  pending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: HowItWorksItem | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (body: FormData) => void;
}) {
  const [error, setError] = useState("");
  const isEditing = item !== null;
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
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="w-[calc(100%-1.5rem)] max-w-[570px] gap-0 overflow-hidden rounded-xl border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl text-[#F1C75B]">
            {isEditing ? "Edit Step" : "Add Step"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#BFA98A]">
            {isEditing
              ? "Update this step&apos;s content and optional image."
              : "Add a new step&apos;s content and optional image."}
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center text-[#E6C66D]"
        >
          <X className="h-5 w-5" />
        </button>
        <form key={item?._id ?? "new"} onSubmit={submit} className="space-y-4 p-5">
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
            <span>{isEditing ? "Replace Image" : "Image"}</span>
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full cursor-pointer rounded-md border border-[#A67C3D] bg-[#6A4833] p-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-[#D6AA50] file:px-3 file:py-2"
            />
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Actions pending={pending} onCancel={onClose} isEditing={isEditing} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputClass =
  "h-10 w-full rounded-md border border-[#A67C3D] bg-[#6A4833] px-3 text-sm text-[#F8E8C4] outline-none focus:border-[#D6AA50]";
const labelClass = "block space-y-1.5 text-xs font-medium text-[#F4D77B]";

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...inputProps } = props;
  return (
    <label className={labelClass}>
      <span>{label} *</span>
      <input {...inputProps} className={inputClass} />
    </label>
  );
}

function Actions({
  pending,
  onCancel,
  isEditing,
}: {
  pending: boolean;
  onCancel: () => void;
  isEditing: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={onCancel}
        className="h-10 cursor-pointer rounded-md border border-[#D6AA50] text-xs text-[#F4D77B] disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="h-10 cursor-pointer rounded-md bg-[#D6AA50] text-xs font-semibold text-[#342315] disabled:opacity-50"
      >
        {pending
          ? isEditing
            ? "Updating..."
            : "Adding..."
          : isEditing
            ? "Save Changes"
            : "Add Step"}
      </button>
    </div>
  );
}

function State({ text, error }: { text: string; error?: boolean }) {
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
