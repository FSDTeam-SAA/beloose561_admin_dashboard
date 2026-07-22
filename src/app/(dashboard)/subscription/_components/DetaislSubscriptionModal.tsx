"use client";

import { CalendarDays, Check, CreditCard, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Subscriber {
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

      <section className="rounded-xl border border-[#CBA24A]/15 p-4"><div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">Subscribed Users</h4><span className="rounded-full bg-[#D6AA50]/10 px-2.5 py-1 text-[10px] text-[#D6AA50]">{subscribers.length} total</span></div>{subscribers.length ? <div className="grid grid-cols-2 gap-2">{subscribers.slice(0, 4).map((user, index) => <SubscriberCard key={typeof user === "string" ? user : user._id || index} user={user} />)}</div> : <div className="rounded-lg border border-dashed border-[#CBA24A]/20 py-5 text-center text-xs text-[#8F8278]">No users are subscribed to this plan yet.</div>}{subscribers.length > 4 ? <p className="mt-3 text-center text-[11px] text-[#BFA98A]">And {subscribers.length - 4} more subscriber{subscribers.length - 4 === 1 ? "" : "s"}</p> : null}</section>
    </DialogContent>
  </Dialog>;
}

function Summary({ icon, label, value, capitalize }: { icon: React.ReactElement; label: string; value: string; capitalize?: boolean }) { return <div className="min-w-0 rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/60 p-3"><div className="mb-2 text-[#D6AA50] [&>svg]:h-4 [&>svg]:w-4">{icon}</div><p className="text-[9px] uppercase tracking-wider text-[#8F8278]">{label}</p><p className={`mt-1 truncate text-xs font-medium text-[#F7E4B3] ${capitalize ? "capitalize" : ""}`} title={value}>{value}</p></div>; }

function SubscriberCard({ user }: { user: string | Subscriber }) {
  if (typeof user === "string") return <div className="min-w-0 rounded-lg bg-[#241e1a]/70 p-3"><p className="truncate text-xs text-[#BFA98A]">Subscriber</p></div>;
  return <div className="min-w-0 rounded-lg bg-[#241e1a]/70 p-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium">{user.fullName || user.name || "Subscriber"}</p>{user.role ? <span className="shrink-0 text-[9px] capitalize text-[#D6AA50]">{user.role}</span> : null}</div><p className="mt-1 truncate text-[10px] text-[#9A8060]">{user.email || user.businessName || user.phoneNumber || "No contact information"}</p>{user.subscriptionExpiry ? <p className="mt-1 text-[9px] text-[#8F8278]">Expires {formatDate(user.subscriptionExpiry)}</p> : null}</div>;
}
