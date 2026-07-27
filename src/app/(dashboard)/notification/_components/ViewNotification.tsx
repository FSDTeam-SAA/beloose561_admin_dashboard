"use client";

import { BellRing, CalendarDays, CheckCheck, Tag, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Notification } from "./NotificationPage";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function ViewNotification({
  notification,
  onOpenChange,
}: {
  notification: Notification | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(notification)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="w-[calc(100%-2rem)] max-w-[620px] gap-4 rounded-2xl border border-[#CBA24A]/20 bg-[#4A2D1D] p-5 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]"
      >
        <DialogHeader>
          <DialogTitle className="pr-8 font-serif text-xl font-normal">
            Notification Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Complete notification information
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close notification details"
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 cursor-pointer text-[#A99D91] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <section className="rounded-xl border border-[#CBA24A]/20 bg-[linear-gradient(135deg,rgba(214,170,80,.14),rgba(36,30,26,.75))] p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D6AA50]/15 text-[#D6AA50]">
              <BellRing className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-xl text-[#F7E4B3]">
                {notification?.title || "Notification"}
              </h3>
              <span
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                  notification?.isRead
                    ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
                    : "border-amber-500/25 bg-amber-950/60 text-amber-400"
                }`}
              >
                {notification?.isRead ? "Read" : "Unread"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-4">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-[#A99D91]">
            Message
          </p>
          <p className="text-sm leading-6 text-[#F7E4B3]">
            {notification?.message || "—"}
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <Detail
            icon={<Tag />}
            label="Notification Type"
            value={notification?.type?.replaceAll("_", " ") || "—"}
          />
          <Detail
            icon={<CalendarDays />}
            label="Received"
            value={formatDate(notification?.createdAt)}
          />
          <Detail
            icon={<CheckCheck />}
            label="Read Status"
            value={notification?.isRead ? "Read" : "Unread"}
          />
          <Detail
            icon={<BellRing />}
            label="Related Reference"
            value={notification?.relatedId || "Not available"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-3">
      <div className="mb-2 text-[#D6AA50] [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>
      <p className="text-[9px] uppercase tracking-wider text-[#8F8278]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs capitalize text-[#F7E4B3]" title={value}>
        {value}
      </p>
    </div>
  );
}
