"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Check, ImageIcon, Loader2, Pencil, Play, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Benefit = { _id: string; images?: string[]; video?: string[]; title?: string; subTitle?: string; features?: string[]; isActive?: boolean };
type ApiResponse<T> = { success?: boolean; message?: string; data?: T };
type MediaSlot = { source: "existing"; url: string; kind: "image" | "video" } | { source: "new"; file: File; url: string; kind: "image" | "video" } | null;

const apiBase = () => {
  const value = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!value) throw new Error("Backend API URL is not configured.");
  return value.replace(/\/$/, "");
};

const existingMedia = (item: Benefit) => [
  ...(item.images || []).map((url) => ({ source: "existing" as const, url, kind: "image" as const })),
  ...(item.video || []).map((url) => ({ source: "existing" as const, url, kind: "video" as const })),
].slice(0, 3);

function MediaPreview({ media, title, className = "" }: { media: NonNullable<MediaSlot>; title: string; className?: string }) {
  if (media.kind === "video") return <video src={media.url} aria-label={title} className={`h-full w-full object-cover ${className}`} muted playsInline controls />;
  return <Image src={media.url} alt={title} fill unoptimized={media.source === "new"} className={`object-cover ${className}`} />;
}

export default function BenefitsPage() {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Benefit | null>(null);
  const query = useQuery({
    queryKey: ["retailer-benefits"],
    queryFn: async () => {
      const params = new URLSearchParams({ page: "1", limit: "100", sortBy: "createdAt", sortOrder: "desc" });
      const response = await fetch(`${apiBase()}/retailer-benefits?${params}`);
      const result = (await response.json().catch(() => null)) as ApiResponse<Benefit[]> | null;
      if (!response.ok || !Array.isArray(result?.data)) throw new Error(result?.message || "Unable to load benefits.");
      return result.data;
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: FormData }) => {
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(`${apiBase()}/retailer-benefits/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body });
      const result = (await response.json().catch(() => null)) as ApiResponse<Benefit> | null;
      if (!response.ok) throw new Error(result?.message || "Unable to update benefits.");
      return result;
    },
    onSuccess: async (result) => {
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["retailer-benefits"] });
      toast.success(result?.message || "Benefits updated successfully.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(`${apiBase()}/retailer-benefits/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const result = (await response.json().catch(() => null)) as ApiResponse<Benefit> | null;
      if (!response.ok) throw new Error(result?.message || "Unable to update benefits visibility.");
      return result;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["retailer-benefits"] });
      toast.success(result?.message || "Benefits visibility updated.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const primaryBenefit = query.data?.[0];

  return <div className="space-y-6">
    <header><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#D6AA50]">Homepage content</p><h1 className="mt-1 font-serif text-2xl text-[#F7E4B3]">Retailer Benefits</h1><p className="mt-1 max-w-2xl text-xs leading-5 text-[#9A8060]">Manage the copy and the three image or video positions shown in the homepage benefits section.</p></header>
    {primaryBenefit && <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#CBA24A]/30 bg-[#2A1E10] p-5 shadow-[0_16px_45px_rgba(0,0,0,.16)]"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#D6AA50]">Section visibility</p><h2 className="mt-1 font-serif text-lg text-[#F7E4B3]">Benefits section</h2><p className="mt-1 text-xs text-[#9A8060]">Show or hide this section on the homepage without opening the editor.</p></div><div className="flex items-center gap-3"><span className={`text-xs font-semibold ${primaryBenefit.isActive !== false ? "text-emerald-400" : "text-[#9A8060]"}`}>{primaryBenefit.isActive !== false ? "Active" : "Inactive"}</span><button type="button" role="switch" aria-checked={primaryBenefit.isActive !== false} aria-label="Toggle benefits section visibility" disabled={toggleStatus.isPending} onClick={() => toggleStatus.mutate({ id: primaryBenefit._id, isActive: primaryBenefit.isActive === false })} className={`relative h-7 w-12 cursor-pointer rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${primaryBenefit.isActive !== false ? "border-emerald-400/50 bg-emerald-500" : "border-[#705A3E] bg-[#1B1009]"}`}><span className={`absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${primaryBenefit.isActive !== false ? "translate-x-5" : "translate-x-0"}`} /></button></div></section>}
    {query.isLoading ? <State loading text="Loading retailer benefits..." /> : query.isError ? <State error text={query.error.message} /> : !query.data?.length ? <State text="No retailer benefits have been added yet." /> : <div className="space-y-6">{query.data.map((item) => {
      const media = existingMedia(item);
      return <article key={item._id} className="overflow-hidden rounded-2xl border border-[#CBA24A]/30 bg-[#2A1E10] shadow-[0_18px_55px_rgba(0,0,0,.2)]"><div className="grid xl:grid-cols-[minmax(320px,42%)_1fr]">
        <div className="grid min-h-72 grid-cols-2 grid-rows-2 gap-px bg-[#CBA24A]/15">{media.length ? media.map((entry, index) => <div key={`${entry.url}-${index}`} className={`relative min-h-36 overflow-hidden bg-[#1B1009] ${media.length === 1 || (media.length === 3 && index === 0) ? "row-span-2" : ""} ${media.length === 1 ? "col-span-2" : ""}`}><MediaPreview media={entry} title={`${item.title || "Benefit"} media ${index + 1}`} />{entry.kind === "video" && <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[9px] uppercase tracking-wider text-white"><Play className="h-2.5 w-2.5 fill-current" /> Video</span>}</div>) : <div className="col-span-2 row-span-2 flex min-h-72 items-center justify-center text-[#705A3E]"><ImageIcon className="h-12 w-12" /></div>}</div>
        <div className="flex flex-col p-6 lg:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#D6AA50]">Why retailers choose us</p><h2 className="mt-2 font-serif text-2xl leading-tight text-[#F7E4B3]">{item.title || "Untitled benefits section"}</h2><p className="mt-3 text-sm leading-6 text-[#BFA98A]">{item.subTitle || "No subtitle has been added."}</p></div><button onClick={() => setEditing(item)} className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-[#D6AA50]/45 px-3 text-[11px] font-semibold text-[#F1C75B] transition hover:bg-[#D6AA50] hover:text-[#342315]"><Pencil className="h-3.5 w-3.5" /> Edit</button></div><div className="mt-7 grid gap-3 sm:grid-cols-2">{item.features?.length ? item.features.map((feature, index) => <div key={`${feature}-${index}`} className="flex gap-3 rounded-xl border border-[#CBA24A]/15 bg-[#382719]/55 p-3.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D6AA50]/15 text-[#F1C75B]"><Check className="h-3.5 w-3.5" /></span><span className="text-xs leading-5 text-[#E8D8BA]">{feature}</span></div>) : <p className="text-xs text-[#9A8060]">No benefit points added.</p>}</div></div>
      </div></article>;
    })}</div>}
    <BenefitDialog item={editing} pending={update.isPending} onClose={() => !update.isPending && setEditing(null)} onSubmit={(body) => editing && update.mutate({ id: editing._id, body })} />
  </div>;
}

function BenefitDialog({ item, pending, onClose, onSubmit }: { item: Benefit | null; pending: boolean; onClose: () => void; onSubmit: (body: FormData) => void }) {
  const [features, setFeatures] = useState<string[]>([""]);
  const [slots, setSlots] = useState<MediaSlot[]>([null, null, null]);
  const [preparing, setPreparing] = useState(false);
  const objectUrls = useRef(new Set<string>());
  useEffect(() => {
    if (!item) return;
    setFeatures(item.features?.length ? item.features : [""]);
    setSlots([...existingMedia(item), null, null, null].slice(0, 3));
  }, [item]);
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const chooseFile = (index: number, file?: File) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) return toast.error("Please choose an image or video file.");
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    setSlots((current) => current.map((slot, slotIndex) => {
      if (slotIndex !== index) return slot;
      if (slot?.source === "new") {
        URL.revokeObjectURL(slot.url);
        objectUrls.current.delete(slot.url);
      }
      return { source: "new", file, url, kind: isVideo ? "video" : "image" };
    }));
  };
  const removeSlot = (index: number) => setSlots((current) => current.map((slot, slotIndex) => {
    if (slotIndex !== index) return slot;
    if (slot?.source === "new") {
      URL.revokeObjectURL(slot.url);
      objectUrls.current.delete(slot.url);
    }
    return null;
  }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("features", JSON.stringify(features.map((value) => value.trim()).filter(Boolean)));
    setPreparing(true);
    try {
      const files = await Promise.all(slots.filter((slot): slot is NonNullable<MediaSlot> => Boolean(slot)).map(async (slot, index) => ({
        kind: slot.kind,
        file: slot.source === "new" ? slot.file : await remoteMediaFile(slot.url, slot.kind, index),
      })));
      files.forEach(({ file, kind }) => form.append(kind === "image" ? "images" : "video", file));
      onSubmit(form);
    } catch {
      toast.error("An existing media file could not be prepared. Please replace that position and try again.");
    } finally {
      setPreparing(false);
    }
  };

  return <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto border-[#CBA24A]/30 bg-[#2A1E10] text-[#F7E4B3] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed sm:max-w-3xl"><DialogHeader><DialogTitle className="font-serif text-xl">Edit retailer benefits</DialogTitle><DialogDescription className="text-[#9A8060]">Update the content and choose an image or video for each of the three homepage positions.</DialogDescription></DialogHeader>{item && <form onSubmit={submit} className="mt-3 space-y-5">
    <Field label="Title"><input name="title" required defaultValue={item.title} className={inputClass} /></Field>
    <Field label="Subtitle"><textarea name="subTitle" required rows={3} defaultValue={item.subTitle} className={inputClass} /></Field>
    <Field label="Benefit points"><div className="space-y-2">{features.map((feature, index) => <div key={index} className="flex gap-2"><input value={feature} onChange={(event) => setFeatures((all) => all.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className={inputClass} placeholder={`Benefit ${index + 1}`} /><button type="button" aria-label="Remove benefit" onClick={() => setFeatures((all) => all.length === 1 ? [""] : all.filter((_, itemIndex) => itemIndex !== index))} className="rounded-md border border-red-500/30 px-3 text-red-400"><X className="h-4 w-4" /></button></div>)}<button type="button" onClick={() => setFeatures((all) => [...all, ""])} className="text-xs font-semibold text-[#F1C75B]">+ Add another benefit</button></div></Field>
    <div className="space-y-3"><div><p className="text-xs font-semibold text-[#DCC59A]">Homepage media</p><p className="mt-1 text-[11px] leading-4 text-[#9A8060]">Each position accepts one image or video. You can replace any position individually; the other media will remain unchanged.</p></div><div className="grid gap-3 sm:grid-cols-3">{slots.map((slot, index) => <MediaInput key={index} index={index} slot={slot} onChoose={chooseFile} onRemove={removeSlot} />)}</div></div>
    <div className="flex justify-end gap-3 border-t border-[#CBA24A]/15 pt-5"><button type="button" disabled={preparing} onClick={onClose} className="h-10 rounded-md border border-[#CBA24A]/25 px-4 text-xs text-[#BFA98A] disabled:opacity-60">Cancel</button><button disabled={pending || preparing} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#D6AA50] px-5 text-xs font-semibold text-[#342315] disabled:opacity-60">{(pending || preparing) && <Loader2 className="h-4 w-4 animate-spin" />}{preparing ? "Preparing media..." : "Save changes"}</button></div>
  </form>}</DialogContent></Dialog>;
}

function MediaInput({ index, slot, onChoose, onRemove }: { index: number; slot: MediaSlot; onChoose: (index: number, file?: File) => void; onRemove: (index: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return <div className="overflow-hidden rounded-xl border border-[#CBA24A]/25 bg-[#1B1009]"><div className="relative aspect-[4/3] overflow-hidden bg-[#120B06]">{slot ? <MediaPreview media={slot} title={`Media position ${index + 1}`} /> : <button type="button" onClick={() => inputRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#8E7452]"><Upload className="h-5 w-5 text-[#D6AA50]" /><span className="text-[11px]">Choose media</span></button>}<span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">Position {index + 1}</span>{slot && <button type="button" aria-label={`Remove media ${index + 1}`} onClick={() => onRemove(index)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-red-700"><X className="h-3.5 w-3.5" /></button>}</div><button type="button" onClick={() => inputRef.current?.click()} className="flex w-full items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] font-semibold text-[#F1C75B]"><Upload className="h-3 w-3" />{slot ? "Replace" : "Upload image or video"}</button><input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(event) => { onChoose(index, event.target.files?.[0]); event.target.value = ""; }} /></div>;
}

async function remoteMediaFile(url: string, kind: "image" | "video", index: number) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to download existing media");
  const blob = await response.blob();
  const type = blob.type || (kind === "video" ? "video/mp4" : "image/jpeg");
  const extension = type.split("/")[1]?.split(";")[0] || (kind === "video" ? "mp4" : "jpg");
  return new File([blob], `benefit-media-${index + 1}.${extension}`, { type });
}

const inputClass = "w-full rounded-lg border border-[#CBA24A]/25 bg-[#1B1009] px-3.5 py-2.5 text-sm text-[#F7E4B3] outline-none placeholder:text-[#705A3E] focus:border-[#D6AA50]";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-2"><span className="text-xs font-semibold text-[#DCC59A]">{label}</span>{children}</label>; }
function State({ text, error, loading }: { text: string; error?: boolean; loading?: boolean }) { return <div className={`flex min-h-52 items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-sm ${error ? "border-red-500/30 text-red-400" : "border-[#CBA24A]/25 text-[#9A8060]"}`}>{loading && <Loader2 className="h-4 w-4 animate-spin" />}{text}</div>; }
