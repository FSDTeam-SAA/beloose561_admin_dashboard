"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  BellRing,
  CheckCheck,
  Clock3,
  Eye,
  PackageCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Pagination from "@/components/pagenation/Pagenation";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ViewNotification from "./ViewNotification";

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

interface NotificationResponse {
  success: boolean;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    unreadCount: number;
  };
  data?: Notification[];
}

interface ActionResponse {
  success: boolean;
  message?: string;
}

type Filter = "all" | "unread" | "read";

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function NotificationIcon({ type }: { type: string }) {
  if (type.includes("product")) return <PackageCheck />;
  if (type.includes("retailer")) return <UserPlus />;
  if (type.includes("approval")) return <BadgeCheck />;
  if (type.includes("reminder") || type.includes("expired")) return <Clock3 />;
  return <BellRing />;
}

export default function NotificationPage() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [deletingNotification, setDeletingNotification] =
    useState<Notification | null>(null);
  const limit = 10;

  const notificationsQuery = useQuery({
    queryKey: ["notifications", page, limit, filter],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (filter !== "all") params.set("isRead", String(filter === "read"));

      const response = await fetch(`${getApiBaseUrl()}/notifation?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as NotificationResponse | null;
      if (
        !response.ok ||
        !result?.success ||
        !Array.isArray(result.data) ||
        !result.meta
      ) {
        throw new Error(result?.message || "Unable to load notifications.");
      }
      return { notifications: result.data, meta: result.meta };
    },
    refetchInterval: 60_000,
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw new Error("You are not authorized.");
      const response = await fetch(`${getApiBaseUrl()}/notifation/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as ActionResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to mark notification read.");
      }
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark notification read.",
      ),
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("You are not authorized.");
      const response = await fetch(`${getApiBaseUrl()}/notifation/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as ActionResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to mark all as read.");
      }
      return result;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(result.message || "All notifications marked as read.");
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark all notifications read.",
      ),
  });

  const notifications = notificationsQuery.data?.notifications ?? [];
  const meta = notificationsQuery.data?.meta;
  const unreadCount = meta?.unreadCount ?? 0;
  const isLoading =
    sessionStatus === "loading" || notificationsQuery.isLoading;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw new Error("You are not authorized.");
      const response = await fetch(`${getApiBaseUrl()}/notifation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as ActionResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to delete notification.");
      }
      return result;
    },
    onSuccess: async (result) => {
      const deletingLastItem = notifications.length === 1 && page > 1;
      setDeletingNotification(null);
      if (deletingLastItem) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(result.message || "Notification deleted successfully.");
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete notification.",
      ),
  });

  return (
    <div className="flex w-full flex-col gap-5">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <Select
              value={filter}
              onValueChange={(value) => {
                setFilter(value as Filter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[120px] border-0 bg-[#2D2015] text-xs text-[#F7E4B3] shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#CBA24A]/25 bg-[#4A2D1D] text-[#F7E4B3]">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              disabled={unreadCount === 0 || readAllMutation.isPending}
              onClick={() => readAllMutation.mutate()}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#D6AA50]/12 px-3 text-xs font-medium text-[#D6AA50] transition hover:bg-[#D6AA50]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">
                {readAllMutation.isPending ? "Updating..." : "Mark all read"}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <StateMessage text="Loading notifications..." />
          ) : notificationsQuery.isError ? (
            <StateMessage text={notificationsQuery.error.message} error />
          ) : !accessToken ? (
            <StateMessage text="You are not authorized." error />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-[#241910]/55 px-6 py-16 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D6AA50]/10 text-[#D6AA50]">
                <Bell className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-[#F7E4B3]">
                No notifications found
              </p>
              <p className="mt-1 text-xs text-[#9A8060]">
                New updates and reminders will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <article
                key={notification._id}
                className={`relative flex items-start gap-4 overflow-hidden rounded-xl px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,.08)] transition before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] hover:-translate-y-0.5 hover:bg-[#332418] ${
                  notification.isRead
                    ? "bg-[#241910]/60 before:bg-[#8A7144]/55"
                    : "bg-[linear-gradient(100deg,rgba(214,170,80,.12),rgba(36,25,16,.82)_38%)] before:bg-[#D6AA50]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&>svg]:h-[18px] [&>svg]:w-[18px] ${
                    notification.isRead
                      ? "bg-[#6F5A3A]/20 text-[#9A8060]"
                      : "bg-[#D6AA50]/15 text-[#D6AA50]"
                  }`}
                >
                  <NotificationIcon type={notification.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`truncate text-sm ${
                            notification.isRead
                              ? "font-medium text-[#D9C9B1]"
                              : "font-semibold text-[#F7E4B3]"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead ? (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#D6AA50]" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[#9A8060]">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[10px] text-[#705F4A]">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!notification.isRead ? (
                        <button
                          type="button"
                          disabled={
                            readMutation.isPending &&
                            readMutation.variables === notification._id
                          }
                          onClick={() => readMutation.mutate(notification._id)}
                          className="cursor-pointer rounded-lg bg-[#D6AA50]/10 px-3 py-1.5 text-[10px] font-medium text-[#D6AA50] transition hover:bg-[#D6AA50]/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {readMutation.isPending &&
                          readMutation.variables === notification._id
                            ? "Updating..."
                            : "Mark as read"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#705F4A]">
                          Read
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedNotification(notification)}
                        aria-label={`View ${notification.title}`}
                        title="View Details"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#D6AA50]/10 text-[#D6AA50] transition hover:bg-[#D6AA50]/20"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingNotification(notification)}
                        aria-label={`Delete ${notification.title}`}
                        title="Delete Notification"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <Pagination
        page={page}
        limit={limit}
        total={meta?.total ?? 0}
        currentCount={notifications.length}
        onPageChange={setPage}
        disabled={notificationsQuery.isFetching}
      />
      <ViewNotification
        notification={selectedNotification}
        onOpenChange={(open) => {
          if (!open) setSelectedNotification(null);
        }}
      />
      <DeleteModal
        open={deletingNotification !== null}
        title="Delete Notification"
        itemName={deletingNotification?.title}
        description={
          deletingNotification
            ? `Are you sure you want to delete “${deletingNotification.title}”? This action cannot be undone.`
            : undefined
        }
        disabled={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingNotification) {
            deleteMutation.mutate(deletingNotification._id);
          }
        }}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setDeletingNotification(null);
          }
        }}
      />
    </div>
  );
}

function StateMessage({ text, error }: { text: string; error?: boolean }) {
  return (
    <p
      className={`px-6 py-16 text-center text-sm ${error ? "text-red-400" : "text-[#9A8060]"}`}
    >
      {text}
    </p>
  );
}
