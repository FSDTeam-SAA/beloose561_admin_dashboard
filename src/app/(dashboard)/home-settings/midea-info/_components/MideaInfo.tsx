"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AtSign,
  ExternalLink,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
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

type ContactInfo = {
  _id: string;
  email?: string;
  phone?: string;
  address?: string;
};
type SocialLink = {
  platform: string;
  url: string;
  icon?: string;
  isActive?: boolean;
};
type SocialMedia = {
  _id: string;
  description?: string;
  socialLinks?: SocialLink[];
  isActive?: boolean;
};
type ApiResponse<T> = { success?: boolean; message?: string; data?: T };

const apiBase = () => {
  const value = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!value) throw new Error("Backend API URL is not configured.");
  return value.replace(/\/$/, "");
};
const listParams = "page=1&limit=1&sortBy=createdAt&sortOrder=desc";

export default function MideaInfo() {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const client = useQueryClient();
  const [contactEdit, setContactEdit] = useState<ContactInfo | null>(null);
  const [socialEdit, setSocialEdit] = useState<SocialMedia | null>(null);

  const contact = useQuery({
    queryKey: ["contact-info", "latest"],
    queryFn: () => getLatest<ContactInfo>("contact-info"),
  });
  const social = useQuery({
    queryKey: ["social-media", "latest"],
    queryFn: () => getLatest<SocialMedia>("social-media"),
  });

  const contactUpdate = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { email: string; phone: string; address: string };
    }) => patchJson<ContactInfo>(`contact-info/${id}`, body, token),
    onSuccess: async (result) => {
      setContactEdit(null);
      await client.invalidateQueries({ queryKey: ["contact-info"] });
      toast.success(result.message || "Contact information updated.");
    },
    onError: showError,
  });
  const socialUpdate = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Omit<SocialMedia, "_id">;
    }) => patchJson<SocialMedia>(`social-media/${id}`, body, token),
    onSuccess: async (result) => {
      setSocialEdit(null);
      await client.invalidateQueries({ queryKey: ["social-media"] });
      toast.success(result.message || "Social media updated.");
    },
    onError: showError,
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#D6AA50]">
          Homepage & footer
        </p>
        <h1 className="mt-1 font-serif text-2xl text-[#F7E4B3]">
          Media Information
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-[#9A8060]">
          Keep your public contact details and social presence accurate and easy
          to find.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          eyebrow="Business details"
          title="Contact Information"
          icon={<AtSign className="h-5 w-5" />}
          action={
            contact.data ? () => setContactEdit(contact.data!) : undefined
          }
        >
          {contact.isLoading ? (
            <State loading text="Loading contact information..." />
          ) : contact.isError ? (
            <State error text={contact.error.message} />
          ) : !contact.data ? (
            <State text="No contact information found." />
          ) : (
            <div className="space-y-3">
              <InfoRow
                icon={<Mail />}
                label="Email address"
                value={contact.data.email}
                href={
                  contact.data.email
                    ? `mailto:${contact.data.email}`
                    : undefined
                }
              />
              <InfoRow
                icon={<Phone />}
                label="Phone number"
                value={contact.data.phone}
                href={
                  contact.data.phone ? `tel:${contact.data.phone}` : undefined
                }
              />
              <InfoRow
                icon={<MapPin />}
                label="Business address"
                value={contact.data.address}
              />
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Online presence"
          title="Social Media"
          icon={<Globe2 className="h-5 w-5" />}
          action={social.data ? () => setSocialEdit(social.data!) : undefined}
        >
          {social.isLoading ? (
            <State loading text="Loading social media..." />
          ) : social.isError ? (
            <State error text={social.error.message} />
          ) : !social.data ? (
            <State text="No social media information found." />
          ) : (
            <div>
              <div className="mb-5 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${social.data.isActive === false ? "bg-[#705A3E]" : "bg-emerald-400"}`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9A8060]">
                  {social.data.isActive === false ? "Hidden" : "Published"}
                </span>
              </div>
              <p className="text-sm leading-6 text-[#CBB696]">
                {social.data.description || "No social description added."}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {social.data.socialLinks?.length ? (
                  social.data.socialLinks.map((link, index) => (
                    <a
                      key={`${link.platform}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`group flex items-center justify-between rounded-xl border border-[#CBA24A]/15 bg-[#382719]/55 p-3.5 transition hover:border-[#D6AA50]/45 ${link.isActive === false ? "opacity-45" : ""}`}
                    >
                      <div>
                        <p className="text-xs font-semibold capitalize text-[#F7E4B3]">
                          {link.platform}
                        </p>
                        <p className="mt-1 max-w-40 truncate text-[10px] text-[#9A8060]">
                          {link.url}
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-[#D6AA50] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-[#9A8060]">
                    No social links added.
                  </p>
                )}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <ContactDialog
        item={contactEdit}
        pending={contactUpdate.isPending}
        onClose={() => !contactUpdate.isPending && setContactEdit(null)}
        onSubmit={(body) =>
          contactEdit && contactUpdate.mutate({ id: contactEdit._id, body })
        }
      />
      <SocialDialog
        item={socialEdit}
        pending={socialUpdate.isPending}
        onClose={() => !socialUpdate.isPending && setSocialEdit(null)}
        onSubmit={(body) =>
          socialEdit && socialUpdate.mutate({ id: socialEdit._id, body })
        }
      />
    </div>
  );
}

async function getLatest<T>(path: string) {
  const response = await fetch(`${apiBase()}/${path}?${listParams}`);
  const result = (await response.json().catch(() => null)) as ApiResponse<
    T[]
  > | null;
  if (!response.ok || !Array.isArray(result?.data))
    throw new Error(result?.message || `Unable to load ${path}.`);
  return result.data[0] ?? null;
}

async function patchJson<T>(path: string, body: unknown, token?: string) {
  if (!token)
    throw new Error("Your session has expired. Please sign in again.");
  const response = await fetch(`${apiBase()}/${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok)
    throw new Error(result?.message || "Unable to save changes.");
  return result || {};
}
function showError(error: Error) {
  toast.error(error.message || "Unable to save changes.");
}

function SectionCard({
  eyebrow,
  title,
  icon,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  action?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#CBA24A]/30 bg-[#2A1E10] shadow-[0_18px_55px_rgba(0,0,0,.18)]">
      <div className="flex items-center justify-between border-b border-[#CBA24A]/15 bg-[#332313] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6AA50]/12 text-[#F1C75B]">
            {icon}
          </span>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#9A8060]">
              {eyebrow}
            </p>
            <h2 className="mt-0.5 font-serif text-lg text-[#F7E4B3]">
              {title}
            </h2>
          </div>
        </div>
        {action && (
          <button
            onClick={action}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#D6AA50]/40 px-3 text-[11px] font-semibold text-[#F1C75B] hover:bg-[#D6AA50] hover:text-[#342315]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>
      <div className="min-h-72 p-5 lg:p-6">{children}</div>
    </section>
  );
}
function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  value?: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D6AA50]/10 text-[#F1C75B]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#9A8060]">
          {label}
        </p>
        <p className="mt-1 break-words text-sm text-[#F7E4B3]">
          {value || "Not provided"}
        </p>
      </div>
    </>
  );
  return href ? (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl border border-[#CBA24A]/15 bg-[#382719]/55 p-3.5 hover:border-[#D6AA50]/40"
    >
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-3 rounded-xl border border-[#CBA24A]/15 bg-[#382719]/55 p-3.5">
      {content}
    </div>
  );
}

function ContactDialog({
  item,
  pending,
  onClose,
  onSubmit,
}: {
  item: ContactInfo | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (body: { email: string; phone: string; address: string }) => void;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit({
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      address: String(data.get("address") || "").trim(),
    });
  };
  return (
    <EditDialog
      open={Boolean(item)}
      title="Edit contact information"
      description="These details are visible to your website visitors."
      pending={pending}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address">
          <input
            name="email"
            type="email"
            required
            defaultValue={item?.email}
            className={inputClass}
          />
        </Field>
        <Field label="Phone number">
          <input
            name="phone"
            type="tel"
            required
            defaultValue={item?.phone}
            className={inputClass}
          />
        </Field>
        <Field label="Business address">
          <textarea
            name="address"
            required
            rows={3}
            defaultValue={item?.address}
            className={inputClass}
          />
        </Field>
        <Actions pending={pending} onClose={onClose} />
      </form>
    </EditDialog>
  );
}

function SocialDialog({
  item,
  pending,
  onClose,
  onSubmit,
}: {
  item: SocialMedia | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (body: Omit<SocialMedia, "_id">) => void;
}) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [active, setActive] = useState(true);
  useEffect(() => {
    if (item) {
      setLinks(item.socialLinks || []);
      setActive(item.isActive !== false);
    }
  }, [item]);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit({
      description: String(data.get("description") || "").trim(),
      isActive: active,
      socialLinks: links
        .map(({ platform, url, isActive }) => ({
          platform: platform.trim().toLowerCase(),
          url: url.trim(),
          isActive: isActive !== false,
        }))
        .filter((link) => link.platform && link.url),
    });
  };
  return (
    <EditDialog
      open={Boolean(item)}
      title="Edit social media"
      description="Manage your brand description, links, and visibility."
      pending={pending}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Brand description">
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={item?.description}
            className={inputClass}
          />
        </Field>
        <button
          type="button"
          onClick={() => setActive(!active)}
          className="flex w-full items-center justify-between rounded-xl border border-[#CBA24A]/20 bg-[#1B1009] p-3.5 text-left"
        >
          <span>
            <span className="block text-xs font-semibold text-[#E8D8BA]">
              Publish social section
            </span>
            <span className="mt-1 block text-[10px] text-[#9A8060]">
              Controls whether this social configuration is active.
            </span>
          </span>
          {active ? (
            <ToggleRight className="h-7 w-7 text-emerald-400" />
          ) : (
            <ToggleLeft className="h-7 w-7 text-[#705A3E]" />
          )}
        </button>
        <Field label="Social links">
          <div className="space-y-3">
            {links.map((link, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#CBA24A]/18 bg-[#382719]/40 p-3"
              >
                <div className="grid gap-2 sm:grid-cols-[.7fr_1.3fr_auto]">
                  <input
                    aria-label="Platform"
                    required
                    value={link.platform}
                    onChange={(e) =>
                      setLinks((all) =>
                        all.map((v, i) =>
                          i === index ? { ...v, platform: e.target.value } : v,
                        ),
                      )
                    }
                    placeholder="Platform"
                    className={inputClass}
                  />
                  <input
                    aria-label="Profile URL"
                    type="url"
                    required
                    value={link.url}
                    onChange={(e) =>
                      setLinks((all) =>
                        all.map((v, i) =>
                          i === index ? { ...v, url: e.target.value } : v,
                        ),
                      )
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setLinks((all) => all.filter((_, i) => i !== index))
                    }
                    className="rounded-md border border-red-500/30 px-3 text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLinks((all) =>
                      all.map((v, i) =>
                        i === index
                          ? { ...v, isActive: v.isActive === false }
                          : v,
                      ),
                    )
                  }
                  className={`mt-2 text-[10px] font-semibold ${link.isActive === false ? "text-[#9A8060]" : "text-emerald-400"}`}
                >
                  {link.isActive === false
                    ? "Inactive — click to enable"
                    : "Active — click to disable"}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setLinks((all) => [
                  ...all,
                  { platform: "", url: "", isActive: true },
                ])
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F1C75B]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add social link
            </button>
          </div>
        </Field>
        <Actions pending={pending} onClose={onClose} />
      </form>
    </EditDialog>
  );
}

function EditDialog({
  open,
  title,
  description,
  pending,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  pending: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !value && !pending && onClose()}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#CBA24A]/30 bg-[#2A1E10] text-[#F7E4B3] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
          <DialogDescription className="text-[#9A8060]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
function Actions({
  pending,
  onClose,
}: {
  pending: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-[#CBA24A]/15 pt-5">
      <button
        type="button"
        onClick={onClose}
        className="h-10 rounded-md border border-[#CBA24A]/25 px-4 text-xs text-[#BFA98A]"
      >
        Cancel
      </button>
      <button
        disabled={pending}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-[#D6AA50] px-5 text-xs font-semibold text-[#342315] disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}Save changes
      </button>
    </div>
  );
}
const inputClass =
  "w-full rounded-lg border border-[#CBA24A]/25 bg-[#1B1009] px-3.5 py-2.5 text-sm text-[#F7E4B3] outline-none placeholder:text-[#705A3E] focus:border-[#D6AA50]";
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold text-[#DCC59A]">{label}</span>
      {children}
    </label>
  );
}
function State({
  text,
  error,
  loading,
}: {
  text: string;
  error?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={`flex min-h-48 items-center justify-center gap-2 text-sm ${error ? "text-red-400" : "text-[#9A8060]"}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {text}
    </div>
  );
}
