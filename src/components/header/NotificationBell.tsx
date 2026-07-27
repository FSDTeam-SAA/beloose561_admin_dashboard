"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface NotificationCountResponse {
  success: boolean;
  meta?: { unreadCount?: number };
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");

  const countQuery = useQuery({
    queryKey: ["notifications", "count"],
    enabled: Boolean(accessToken && baseUrl),
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/notifation?limit=1&page=1`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as NotificationCountResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error("Unable to load notification count.");
      }
      return result.meta?.unreadCount ?? 0;
    },
    refetchInterval: 60_000,
  });

  const unreadCount = countQuery.data ?? 0;

  return (
    <Link
      href="/notification"
      aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
      title="Notifications"
      className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#CBA24A]/20 bg-[#24180D] text-[#D6AA50] transition hover:border-[#D6AA50]/60 hover:bg-[#D6AA50]/10"
    >
      <Bell className="h-[18px] w-[18px]" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#2A1E10] bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
