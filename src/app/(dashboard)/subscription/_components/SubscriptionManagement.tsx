"use client";

import { useEffect, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import DetaislSubscriptionModal, {
  type Subscription,
} from "./DetaislSubscriptionModal";

interface ListResponse {
  success: boolean;
  message?: string;
  data?: {
    meta?: { page: number; limit: number; total: number };
    data?: Subscription[];
  };
}

interface ActionResponse {
  success: boolean;
  message?: string;
}

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function SubscriptionManagement() {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const queryClient = useQueryClient();
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  const subscriberLimit = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setSubscriberPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "1000",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (searchTerm) params.set("searchTerm", searchTerm);

      const response = await fetch(`${getApiBaseUrl()}/subscribe?${params}`);
      const result = (await response
        .json()
        .catch(() => null)) as ListResponse | null;
      const subscriptions = result?.data?.data;

      if (!response.ok || !result?.success || !Array.isArray(subscriptions)) {
        throw new Error(result?.message || "Unable to load subscriptions.");
      }
      return subscriptions;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (subscription: Subscription) => {
      if (!accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(
        `${getApiBaseUrl()}/subscribe/${subscription._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as ActionResponse | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to delete subscription.");
      }
      return result;
    },
    onSuccess: async (result) => {
      setDeleting(null);
      setSubscriberPage(1);
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(result.message || "Subscription deleted successfully.");
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete subscription.",
      ),
  });

  const subscriptions = subscriptionsQuery.data ?? [];
  const subscribers = subscriptions.flatMap((subscription) =>
    (subscription.user ?? []).map((user) => ({ user, subscription })),
  );
  const paginatedSubscribers = subscribers.slice(
    (subscriberPage - 1) * subscriberLimit,
    subscriberPage * subscriberLimit,
  );

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[#F7E4B3]">
              Subscription Plans
            </h2>
            <p className="mt-1 text-xs text-[#9A8060]">
              Available subscription plans and pricing
            </p>
          </div>
          <div className="relative w-full max-w-[360px]">
            <Input
              type="search"
              placeholder="Search subscription plans..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="h-10 w-full rounded-lg border border-[#CBA24A]/30 bg-[#1C120C]/90 pl-10 pr-4 text-xs text-[#F7E4B3] placeholder:text-stone-600 focus:border-[#CBA24A]/80 focus-visible:ring-0"
            />
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-[#CBA24A]/55">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#1B1009]">
              <tr>
                {[
                  "Plan Name",
                  "Billing Cycle",
                  "Price",
                  "Features",
                  "Subscribers",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#F7E4B3]/75 ${heading === "Actions" ? "text-right" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBA24A]/35 bg-[#342315]/45">
              {subscriptionsQuery.isLoading ? (
                <MessageRow text="Loading subscriptions..." />
              ) : subscriptionsQuery.isError ? (
                <MessageRow
                  text={subscriptionsQuery.error.message}
                  error
                />
              ) : subscriptions.length === 0 ? (
                <MessageRow text="No subscriptions found." />
              ) : (
                subscriptions.map((subscription) => (
                  <tr
                    key={subscription._id}
                    className="h-16 hover:bg-[#4A301D]/55"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#F7E4B3]">
                      {subscription.planName || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-[#BFA98A]">
                      {subscription.plan || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#D6AA50]">
                      ${Number(subscription.price || 0).toLocaleString()}
                    </td>
                    <td
                      className="max-w-[230px] truncate px-6 py-4 text-sm text-[#BFA98A]"
                      title={subscription.features?.join(", ")}
                    >
                      {subscription.features?.length
                        ? subscription.features.join(", ")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#BFA98A]">
                      {subscription.user?.length ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#BFA98A]">
                      {formatDate(subscription.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelected(subscription)}
                          title="View Subscription"
                          className="cursor-pointer p-1 text-stone-400 hover:text-[#D6AA50]"
                        >
                          <Eye className="h-[18px] w-[18px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(subscription)}
                          title="Delete Subscription"
                          className="cursor-pointer p-1 text-stone-400 hover:text-red-500"
                        >
                          <Trash2 className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl text-[#F7E4B3]">
            Subscribed Users
          </h2>
          <p className="mt-1 text-xs text-[#9A8060]">
            Everyone currently assigned to a subscription plan
          </p>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-[#CBA24A]/55">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead className="bg-[#1B1009]">
              <tr>
                {[
                  "Subscriber",
                  "Contact",
                  "Plan",
                  "Billing Cycle",
                  "Status",
                  "Expiry",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#F7E4B3]/75"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBA24A]/35 bg-[#342315]/45">
              {subscriptionsQuery.isLoading ? (
                <SubscriberMessageRow text="Loading subscribers..." />
              ) : subscriptionsQuery.isError ? (
                <SubscriberMessageRow
                  text={subscriptionsQuery.error.message}
                  error
                />
              ) : paginatedSubscribers.length === 0 ? (
                <SubscriberMessageRow text="No subscribed users found." />
              ) : (
                paginatedSubscribers.map(({ user, subscription }, index) => {
                  const subscriber =
                    typeof user === "string" ? undefined : user;
                  return (
                    <tr
                      key={`${subscription._id}-${typeof user === "string" ? user : user._id || index}`}
                      className="h-16 hover:bg-[#4A301D]/55"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#F7E4B3]">
                          {subscriber?.fullName ||
                            subscriber?.name ||
                            "Subscriber"}
                        </p>
                        <p className="mt-1 text-[10px] capitalize text-[#9A8060]">
                          {subscriber?.role || "User"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#BFA98A]">
                        {subscriber?.email ||
                          subscriber?.businessName ||
                          subscriber?.phoneNumber ||
                          "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#D6AA50]">
                        {subscription.planName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-[#BFA98A]">
                        {subscription.plan || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${
                            subscriber?.status === "active"
                              ? "border-emerald-500/20 bg-emerald-950/60 text-emerald-400"
                              : "border-amber-500/20 bg-amber-950/60 text-amber-400"
                          }`}
                        >
                          {subscriber?.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#BFA98A]">
                        {formatDate(subscriber?.subscriptionExpiry)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={subscriberPage}
          limit={subscriberLimit}
          total={subscribers.length}
          currentCount={paginatedSubscribers.length}
          onPageChange={setSubscriberPage}
          disabled={subscriptionsQuery.isFetching}
        />
      </section>

      <DetaislSubscriptionModal
        open={selected !== null}
        subscription={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
      <DeleteModal
        open={deleting !== null}
        title="Delete Subscription"
        itemName={deleting?.planName}
        disabled={deleteMutation.isPending}
        description={
          deleting
            ? `Are you sure you want to delete the ${deleting.planName || "selected"} subscription plan?`
            : undefined
        }
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting);
        }}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleting(null);
        }}
      />
    </div>
  );
}

function MessageRow({ text, error }: { text: string; error?: boolean }) {
  return (
    <tr>
      <td
        colSpan={7}
        className={`h-28 px-6 text-center text-sm ${error ? "text-red-400" : "text-[#9A8060]"}`}
      >
        {text}
      </td>
    </tr>
  );
}

function SubscriberMessageRow({
  text,
  error,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <tr>
      <td
        colSpan={6}
        className={`h-28 px-6 text-center text-sm ${error ? "text-red-400" : "text-[#9A8060]"}`}
      >
        {text}
      </td>
    </tr>
  );
}
