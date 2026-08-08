"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Check, ImageIcon, Loader2, Pencil, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Benefit = { _id: string; images?: string[]; title?: string; subTitle?: string; features?: string[] };
type ApiResponse<T> = { success?: boolean; message?: string; data?: T };

const apiBase = () => {
  const value = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!value) throw new Error("Backend API URL is not configured.");
  return value.replace(/\/$/, "");
};

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

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#D6AA50]">Homepage content</p>
        <h1 className="mt-1 font-serif text-2xl text-[#F7E4B3]">Retailer Benefits</h1>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-[#9A8060]">Review and update the benefits your retailers see on the homepage.</p>
      </header>

      {query.isLoading ? <State loading text="Loading retailer benefits..." /> : query.isError ? <State error text={query.error.message} /> : !query.data?.length ? <State text="No retailer benefits have been added yet." /> : (
        <div className="space-y-6">
          {query.data.map((item) => (
            <article key={item._id} className="overflow-hidden rounded-2xl border border-[#CBA24A]/30 bg-[#2A1E10] shadow-[0_18px_55px_rgba(0,0,0,.2)]">
              <div className="grid xl:grid-cols-[minmax(320px,42%)_1fr]">
                <div className="grid min-h-72 grid-cols-2 gap-px bg-[#CBA24A]/15">
                  {(item.images?.length ? item.images.slice(0, 4) : [""]).map((image, index) => (
                    <div key={`${image}-${index}`} className={`relative bg-[#1B1009] ${item.images?.length === 1 ? "col-span-2" : ""}`}>
                      {image ? <Image src={image} alt={`${item.title || "Benefit"} image ${index + 1}`} fill className="object-cover" /> : <div className="flex h-full min-h-72 items-center justify-center text-[#705A3E]"><ImageIcon className="h-12 w-12" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#D6AA50]">Why retailers choose us</p>
                      <h2 className="mt-2 font-serif text-2xl leading-tight text-[#F7E4B3]">{item.title || "Untitled benefits section"}</h2>
                      <p className="mt-3 text-sm leading-6 text-[#BFA98A]">{item.subTitle || "No subtitle has been added."}</p>
                    </div>
                    <button onClick={() => setEditing(item)} className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-[#D6AA50]/45 px-3 text-[11px] font-semibold text-[#F1C75B] transition hover:bg-[#D6AA50] hover:text-[#342315]"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  </div>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {item.features?.length ? item.features.map((feature, index) => <div key={`${feature}-${index}`} className="flex gap-3 rounded-xl border border-[#CBA24A]/15 bg-[#382719]/55 p-3.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D6AA50]/15 text-[#F1C75B]"><Check className="h-3.5 w-3.5" /></span><span className="text-xs leading-5 text-[#E8D8BA]">{feature}</span></div>) : <p className="text-xs text-[#9A8060]">No benefit points added.</p>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <BenefitDialog item={editing} pending={update.isPending} onClose={() => !update.isPending && setEditing(null)} onSubmit={(body) => editing && update.mutate({ id: editing._id, body })} />
    </div>
  );
}

function BenefitDialog({ item, pending, onClose, onSubmit }: { item: Benefit | null; pending: boolean; onClose: () => void; onSubmit: (body: FormData) => void }) {
  const [features, setFeatures] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  useEffect(() => { if (item) { setFeatures(item.features?.length ? item.features : [""]); setFiles([]); } }, [item]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.delete("images");
    form.set("features", JSON.stringify(features.map((v) => v.trim()).filter(Boolean)));
    files.forEach((file) => form.append("images", file));
    onSubmit(form);
  };
  return <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto border-[#CBA24A]/30 bg-[#2A1E10] text-[#F7E4B3] sm:max-w-2xl"><DialogHeader><DialogTitle className="font-serif text-xl">Edit retailer benefits</DialogTitle><DialogDescription className="text-[#9A8060]">Update the copy, benefit points, or replace the image gallery.</DialogDescription></DialogHeader>{item && <form onSubmit={submit} className="mt-3 space-y-5"><Field label="Title"><input name="title" required defaultValue={item.title} className={inputClass} /></Field><Field label="Subtitle"><textarea name="subTitle" required rows={3} defaultValue={item.subTitle} className={inputClass} /></Field><Field label="Benefit points"><div className="space-y-2">{features.map((feature, index) => <div key={index} className="flex gap-2"><input value={feature} onChange={(e) => setFeatures((all) => all.map((v, i) => i === index ? e.target.value : v))} className={inputClass} placeholder={`Benefit ${index + 1}`} /><button type="button" aria-label="Remove benefit" onClick={() => setFeatures((all) => all.length === 1 ? [""] : all.filter((_, i) => i !== index))} className="rounded-md border border-red-500/30 px-3 text-red-400"><X className="h-4 w-4" /></button></div>)}<button type="button" onClick={() => setFeatures((all) => [...all, ""])} className="text-xs font-semibold text-[#F1C75B]">+ Add another benefit</button></div></Field><Field label="Replace images (optional)"><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#D6AA50]/40 bg-[#382719]/40 px-4 py-6 text-xs text-[#BFA98A]"><Upload className="h-4 w-4 text-[#F1C75B]" />{files.length ? `${files.length} image${files.length > 1 ? "s" : ""} selected` : "Choose up to 10 images"}<input name="images" type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 10))} /></label></Field><div className="flex justify-end gap-3 border-t border-[#CBA24A]/15 pt-5"><button type="button" onClick={onClose} className="h-10 rounded-md border border-[#CBA24A]/25 px-4 text-xs text-[#BFA98A]">Cancel</button><button disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#D6AA50] px-5 text-xs font-semibold text-[#342315] disabled:opacity-60">{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save changes</button></div></form>}</DialogContent></Dialog>;
}

const inputClass = "w-full rounded-lg border border-[#CBA24A]/25 bg-[#1B1009] px-3.5 py-2.5 text-sm text-[#F7E4B3] outline-none placeholder:text-[#705A3E] focus:border-[#D6AA50]";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-2"><span className="text-xs font-semibold text-[#DCC59A]">{label}</span>{children}</label>; }
function State({ text, error, loading }: { text: string; error?: boolean; loading?: boolean }) { return <div className={`flex min-h-52 items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-sm ${error ? "border-red-500/30 text-red-400" : "border-[#CBA24A]/25 text-[#9A8060]"}`}>{loading && <Loader2 className="h-4 w-4 animate-spin" />}{text}</div>; }
