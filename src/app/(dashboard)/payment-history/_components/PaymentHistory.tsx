"use client";

import { useState } from "react";
import { CalendarDays, CreditCard, Eye, UserRound, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Pagination from "@/components/pagenation/Pagenation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentUser {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
  verfied?: string;
  status?: string;
  isSubscription?: boolean;
  subscriptionExpiry?: string;
}

interface PaymentSubscription {
  _id: string;
  planName?: string;
  price?: number;
  plan?: string;
  features?: string[];
}

interface Payment {
  _id: string;
  user?: string | PaymentUser;
  subscribe?: string | PaymentSubscription;
  amount: number;
  paymentType?: string;
  status?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  meta?: { page: number; limit: number; total: number };
  data?: Payment[];
}

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

function formatDate(value?: string, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
}

export default function PaymentHistory() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const limit = 10;

  const paymentsQuery = useQuery({
    queryKey: ["payments", page, limit],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
      });
      const response = await fetch(`${getApiBaseUrl()}/payment?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as PaymentResponse | null;

      if (
        !response.ok ||
        !result?.success ||
        !Array.isArray(result.data) ||
        !result.meta
      ) {
        throw new Error(result?.message || "Unable to load payment history.");
      }
      return { payments: result.data, meta: result.meta };
    },
  });

  const payments = paymentsQuery.data?.payments ?? [];
  const total = paymentsQuery.data?.meta.total ?? 0;
  const isLoading = sessionStatus === "loading" || paymentsQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-5">
      {/* <div>
        <h2 className="font-serif text-xl text-[#F7E4B3]">Payment History</h2>
        <p className="mt-1 text-xs text-[#9A8060]">
          Review all subscription payment transactions
        </p>
      </div> */}

      <div className="w-full overflow-x-auto rounded-xl border border-[#CBA24A]/40">
        <table className="w-full min-w-[950px] border-collapse text-left">
          <thead className="bg-[#1B1009]">
            <tr>
              {[
                "Customer",
                "Subscription",
                "Amount",
                "Payment Type",
                "Status",
                "Date",
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
          <tbody className="divide-y divide-[#CBA24A]/25 bg-[#342315]/45">
            {isLoading ? (
              <MessageRow text="Loading payment history..." />
            ) : paymentsQuery.isError ? (
              <MessageRow text={paymentsQuery.error.message} error />
            ) : !accessToken ? (
              <MessageRow text="You are not authorized." error />
            ) : payments.length === 0 ? (
              <MessageRow text="No payment history found." />
            ) : (
              payments.map((payment) => {
                const user =
                  payment.user && typeof payment.user !== "string"
                    ? payment.user
                    : undefined;
                const subscription =
                  payment.subscribe && typeof payment.subscribe !== "string"
                    ? payment.subscribe
                    : undefined;
                return (
                  <tr
                    key={payment._id}
                    className="h-[72px] transition-colors hover:bg-[#4A301D]/45"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#F7E4B3]">
                        {user?.fullName || "Unknown customer"}
                      </p>
                      <p className="mt-1 text-[10px] text-[#9A8060]">
                        {user?.email || "No email"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#D9C9B1]">
                        {subscription?.planName || "—"}
                      </p>
                      <p className="mt-1 text-[10px] capitalize text-[#9A8060]">
                        {subscription?.plan || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#D6AA50]">
                      ${Number(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-[#BFA98A]">
                      {payment.paymentType || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatus status={payment.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-[#BFA98A]">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayment(payment)}
                        title="View Payment Details"
                        aria-label={`View payment for ${user?.fullName || "customer"}`}
                        className="cursor-pointer p-1 text-stone-400 transition-colors hover:text-[#D6AA50]"
                      >
                        <Eye className="h-[18px] w-[18px]" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        currentCount={payments.length}
        onPageChange={setPage}
        disabled={paymentsQuery.isFetching}
      />

      <PaymentDetailsModal
        payment={selectedPayment}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
        }}
      />
    </div>
  );
}

function PaymentDetailsModal({
  payment,
  onOpenChange,
}: {
  payment: Payment | null;
  onOpenChange: (open: boolean) => void;
}) {
  const user =
    payment?.user && typeof payment.user !== "string"
      ? payment.user
      : undefined;
  const subscription =
    payment?.subscribe && typeof payment.subscribe !== "string"
      ? payment.subscribe
      : undefined;

  return (
    <Dialog open={Boolean(payment)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-sm"
        className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[720px] gap-4 overflow-y-auto rounded-2xl border border-[#CBA24A]/20 bg-[#4A2D1D] p-5 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <DialogHeader>
          <DialogTitle className="pr-8 font-serif text-xl font-normal">
            Payment Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Complete payment transaction details
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close payment details"
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 cursor-pointer text-[#A99D91] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <section className="rounded-xl border border-[#CBA24A]/20 bg-[linear-gradient(135deg,rgba(214,170,80,.14),rgba(36,30,26,.75))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[.18em] text-[#A99D91]">
                Transaction Amount
              </p>
              <p className="mt-2 font-serif text-3xl text-[#D6AA50]">
                ${Number(payment?.amount || 0).toLocaleString()}
              </p>
              <p className="mt-1 text-xs capitalize text-[#BFA98A]">
                {payment?.paymentType || "Payment"}
              </p>
            </div>
            <PaymentStatus status={payment?.status} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={<UserRound />}
            label="Customer"
            value={user?.fullName || "Unknown"}
          />
          <SummaryCard
            icon={<CreditCard />}
            label="Plan"
            value={subscription?.planName || "—"}
          />
          <SummaryCard
            icon={<CalendarDays />}
            label="Paid On"
            value={formatDate(payment?.createdAt)}
          />
        </div>

        <DetailSection
          title="Customer Information"
          items={[
            ["Full Name", user?.fullName],
            ["Email", user?.email],
            ["Role", user?.role],
            ["Verification", user?.verfied],
            ["Account Status", user?.status],
            [
              "Subscription Expiry",
              formatDate(user?.subscriptionExpiry),
            ],
          ]}
        />

        <DetailSection
          title="Subscription Information"
          items={[
            ["Plan Name", subscription?.planName],
            ["Billing Cycle", subscription?.plan],
            [
              "Plan Price",
              subscription?.price === undefined
                ? undefined
                : `$${subscription.price.toLocaleString()}`,
            ],
            [
              "Features",
              subscription?.features?.length
                ? `${subscription.features.length} included`
                : "—",
            ],
          ]}
        />

        <DetailSection
          title="Transaction Information"
          items={[
            ["Payment Type", payment?.paymentType],
            ["Payment Status", payment?.status],
            ["Payment Intent ID", payment?.stripePaymentIntentId],
            ["Created", formatDate(payment?.createdAt, true)],
            ["Last Updated", formatDate(payment?.updatedAt, true)],
          ]}
        />

        {subscription?.features?.length ? (
          <section className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
              Plan Features
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {subscription.features.map((feature, index) => (
                <div
                  key={`${feature}-${index}`}
                  className="rounded-lg bg-[#D6AA50]/[0.07] px-3 py-2 text-xs text-[#D9C9B1]"
                >
                  {feature}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PaymentStatus({ status }: { status?: string }) {
  const normalized = status?.toLowerCase() || "unknown";
  const style =
    normalized === "completed" || normalized === "succeeded"
      ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
      : normalized === "failed" || normalized === "cancelled"
        ? "border-red-500/25 bg-red-950/60 text-red-400"
        : "border-amber-500/25 bg-amber-950/60 text-amber-400";
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold capitalize ${style}`}
    >
      {normalized}
    </span>
  );
}

function SummaryCard({
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
      <p className="mt-1 truncate text-xs font-medium" title={value}>
        {value}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string | undefined]>;
}) {
  return (
    <section className="rounded-xl border border-[#CBA24A]/15 bg-[#241e1a]/70 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#D6AA50]">
        {title}
      </h4>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="mb-1 text-[10px] uppercase tracking-wider text-[#A99D91]">
              {label}
            </dt>
            <dd
              className="truncate text-sm capitalize text-[#F7E4B3]"
              title={value || "—"}
            >
              {value || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function MessageRow({ text, error }: { text: string; error?: boolean }) {
  return (
    <tr>
      <td
        colSpan={7}
        className={`h-32 px-6 text-center text-sm ${error ? "text-red-400" : "text-[#9A8060]"}`}
      >
        {text}
      </td>
    </tr>
  );
}
