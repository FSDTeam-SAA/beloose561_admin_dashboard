"use client";

import { CalendarDays, Check, CreditCard, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface Subscriber {
  _id?: string; fullName?: string; name?: string; email?: string; role?: string;
  businessName?: string; phoneNumber?: string; subscriptionExpiry?: string; status?: string;
}
export interface Subscription {
  _id: string; planName?: string; price?: number; plan?: string; features?: string[];
  user?: Array<string | Subscriber>; createdAt?: string; updatedAt?: string;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function DetaislSubscriptionModal({ open, subscription, onOpenChange }: { open: boolean; subscription: Subscription | null; onOpenChange: (open: boolean) => void }) {
  if (!subscription) return null;
  const subscribers = subscription.user ?? [];
  const price = Number(subscription.price ?? 0);

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} overlayClassName="bg-black/70 backdrop-blur-sm" className="w-[calc(100%-2rem)] max-w-[640px] gap-4 overflow-hidden rounded-2xl border border-[#CBA24A]/20 bg-[#1b1816] p-5 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]">
      <DialogHeader><DialogTitle className="pr-8 font-serif text-xl font-normal">Subscription Details</DialogTitle><DialogDescription className="sr-only">Details for {subscription.planName || "subscription plan"}</DialogDescription></DialogHeader>
      <button type="button" aria-label="Close subscription details" onClick={() => onOpenChange(false)} className="absolute right-5 top-5 cursor-pointer text-[#A99D91] hover:text-white"><X className="h-5 w-5" /></button>

      <section className="rounded-xl border border-[#CBA24A]/20 bg-[linear-gradient(135deg,rgba(214,170,80,.13),rgba(36,30,26,.75))] p-4">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-[#A99D91]">Subscription Plan</p><h3 className="mt-1 font-serif text-2xl text-[#F7E4B3]">{subscription.planName || "Unnamed Plan"}</h3><p className="mt-1 text-xs capitalize text-[#BFA98A]">{subscription.plan || "Billing cycle not set"} billing</p></div><div className="text-right"><p className="text-2xl font-semibold text-[#D6AA50]">${price.toLocaleString()}</p><p className="text-[10px] capitalize text-[#A99D91]">per {subscription.plan || "plan"}</p></div></div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <Summary icon={<CreditCard />} label="Billing Cycle" value={subscription.plan || "—"} capitalize />
        <Summary icon={<Users />} label="Subscribers" value={String(subscribers.length)} />
        <Summary icon={<CalendarDays />} label="Created" value={formatDate(subscription.createdAt)} />
      </div>

      <section className="rounded-xl border border-[#CBA24A]/15 p-4"><h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">Plan Features</h4>{subscription.features?.length ? <div className="grid grid-cols-2 gap-x-5 gap-y-2">{subscription.features.map((feature, index) => <div key={`${feature}-${index}`} className="flex min-w-0 items-start gap-2"><span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400"><Check className="h-2.5 w-2.5" /></span><span className="text-xs leading-4 text-[#D9C9B1]">{feature}</span></div>)}</div> : <p className="text-xs text-[#8F8278]">No features have been added to this plan.</p>}</section>

    </DialogContent>
  </Dialog>;
}

function Summary({ icon, label, value, capitalize }: { icon: React.ReactElement; label: string; value: string; capitalize?: boolean }) { return <div className="min-w-0 rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/60 p-3"><div className="mb-2 text-[#D6AA50] [&>svg]:h-4 [&>svg]:w-4">{icon}</div><p className="text-[9px] uppercase tracking-wider text-[#8F8278]">{label}</p><p className={`mt-1 truncate text-xs font-medium text-[#F7E4B3] ${capitalize ? "capitalize" : ""}`} title={value}>{value}</p></div>; }
