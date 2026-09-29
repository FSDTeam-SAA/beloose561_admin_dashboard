"use client";

import { useEffect, useState } from "react";
import { Eye, FileUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import AddMasterDatabase, { type CigarFormValues } from "./AddMasterDatabase";
import BulkUploadMasterDatabase from "./BulkUploadMasterDatabase";
import ViewMasterDatabase from "./ViewMasterDatabase";

export interface SubmittedRetailer {
  _id: string;
  userId?: string;
  storeName?: string;
  address?: string;
  phoneNumber?: string;
  city?: string;
  description?: string;
  storeSlug?: string;
  status?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  logo?: string;
}

export interface Cigar {
  _id: string;
  productLine: string;
  brand: string;
  name?: string;
  upcCodes?: string[];
  manufacturer?: string;
  country?: string;
  originRegion?: string;
  vitola?: string;
  thumbnail?: string;
  tastingNotes?: string;
  strength?: string;
  wrapper?: string;
  binder?: string;
  filler?: string[];
  size?: string;
  length?: string;
  ringGauge?: number;
  flavorNotes?: string[];
  description?: string;
  whyYoullLikeThis?: string;
  image?: string;
  estimatedSmokingTime?: string;
  pairingSuggestions?: string[];
  suggestedRetailPriceEach?: number;
  suggestedRetailPricePerBox?: number;
  status?: string;
  submittedByRetailer?: string | SubmittedRetailer;
  createdAt: string;
  updatedAt?: string;
}
interface ApiResponse {
  success: boolean;
  message?: string;
  errorSources?: { path?: string; message?: string }[];
  meta?: { page: number; limit: number; total: number };
  data?: Cigar[] | Cigar;
}
const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
};

const normalizeAccessToken = (value?: string) =>
  value
    ?.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^Bearer\s+/i, "");

const isInvalidTokenError = (message?: string) =>
  Boolean(
    message &&
      /token signature is invalid|invalid signature|jwt malformed|jwt expired|token expired/i.test(
        message,
      ),
  );

export default function MasterDatabase() {
  const { data: session } = useSession();
  const token = normalizeAccessToken(
    (session?.user as { accessToken?: string } | undefined)?.accessToken,
  );
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<Cigar | null>(null);
  const [viewing, setViewing] = useState<Cigar | null>(null);
  const [deleting, setDeleting] = useState<Cigar | null>(null);
  const limit = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);
  const query = useQuery({
    queryKey: ["master-database", page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (searchTerm) params.set("searchTerm", searchTerm);
      const response = await fetch(
        `${getApiBaseUrl()}/master-database?${params}`,
      );
      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;
      if (
        !response.ok ||
        !result?.success ||
        !Array.isArray(result.data) ||
        !result.meta
      )
        throw new Error(result?.message || "Unable to load master database.");
      return { cigars: result.data, meta: result.meta };
    },
  });
  const saveMutation = useMutation({
    mutationFn: async (values: CigarFormValues) => {
      if (!token)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(
        editing
          ? `${getApiBaseUrl()}/master-database/${editing._id}`
          : `${getApiBaseUrl()}/master-database`,
        {
          method: editing ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;
      if (!response.ok || !result?.success) {
        if (isInvalidTokenError(result?.message)) {
          await signOut({ callbackUrl: "/signin" });
          throw new Error("Your session is no longer valid. Please sign in again.");
        }
        throw new Error(
          result?.errorSources
            ?.map((source) => source.message)
            .filter(Boolean)
            .join(", ") ||
            result?.message ||
            `Unable to ${editing ? "update" : "add"} product.`,
        );
      }
      return result;
    },
    onSuccess: async (result) => {
      toast.success(
        result.message || (editing ? "Product updated." : "Product added."),
      );
      setFormOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["master-database"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const bulkUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!token)
        throw new Error("Your session has expired. Please sign in again.");
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch(
        `${getApiBaseUrl()}/master-database/bulk-upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;
      if (!response.ok || !result?.success) {
        if (isInvalidTokenError(result?.message)) {
          await signOut({ callbackUrl: "/signin" });
          throw new Error("Your session is no longer valid. Please sign in again.");
        }
        throw new Error(
          result?.errorSources
            ?.map((source) => source.message)
            .filter(Boolean)
            .join(", ") ||
            result?.message ||
            "Unable to upload CSV file.",
        );
      }
      return result;
    },
    onSuccess: async (result) => {
      const summary = result.data as unknown as {
        totalRows?: number;
        insertedCount?: number;
        duplicateSkippedCount?: number;
        invalidCount?: number;
      } | undefined;
      const detailMsg = summary?.totalRows
        ? ` (${summary.insertedCount ?? 0} added, ${summary.duplicateSkippedCount ?? 0} skipped duplicates, ${summary.invalidCount ?? 0} invalid)`
        : "";
      toast.success((result.message || "Bulk data uploaded successfully.") + detailMsg);
      setBulkOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["master-database"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(
        `${getApiBaseUrl()}/master-database/master-database/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;
      if (!response.ok || !result?.success)
        throw new Error(result?.message || "Unable to delete product.");
      return result;
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Product deleted.");
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["master-database"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const cigars = query.data?.cigars || [];
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* <h1 className="flex items-center gap-3 font-serif text-2xl text-[#F7E4B3]">
            <Database className="h-6 w-6 text-[#D6AA50]" />
            Master Database
          </h1>
          <p className="mt-1 text-xs text-[#BFA98A]">
            The central catalog of all cigar products
          </p> */}
        </div>
        <div className="flex flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#D6AA50] px-5 text-xs font-semibold text-[#2B1B10] hover:bg-[#E7BF69]"
          >
            <Plus className="h-4 w-4" />
            Add Manually
          </button>
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#D6AA50] px-5 text-xs font-semibold text-[#F4D77B] hover:bg-[#D6AA50]/10"
          >
            <FileUp className="h-4 w-4" />
            Add Bulk Data
          </button>
        </div>
      </div>
      <div className="relative w-full max-w-[360px]">
        <Input
          type="search"
          placeholder="Search by name or brand..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-10 w-full rounded-lg border border-[#CBA24A]/25 bg-[#342315]/35 pl-10 pr-4 text-sm text-[#F7E4B3] placeholder:text-[#9A8060] focus-visible:ring-0"
        />
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8060]" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#CBA24A]/30">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead className="bg-[#1B1009]">
            <tr>
              {[
                "Product Line / Name",
                "Brand",
                "UPC",
                "Strength",
                "Wrapper",
                "Price Each",
                "Price Box",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#BFA98A] ${h === "Actions" ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CBA24A]/20 bg-[#342315]/35">
            {query.isLoading ? (
              <RowMessage text="Loading master database..." />
            ) : query.isError ? (
              <RowMessage text={query.error.message} error />
            ) : cigars.length === 0 ? (
              <RowMessage text="No cigars found." />
            ) : (
              cigars.map((cigar, index) => (
                <tr
                  key={`${cigar._id}-${index}`}
                  className="h-[66px] hover:bg-[#4A301D]/45"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#F7E4B3]">
                    <div>{cigar.productLine || cigar.name || "—"}</div>
                    {cigar.name && cigar.productLine && cigar.name !== cigar.productLine && (
                      <div className="text-xs font-normal text-[#BFA98A]">{cigar.name}</div>
                    )}
                  </td>
                  <Cell>{cigar.brand}</Cell>
                  <td className="px-6 py-4 text-xs font-mono text-[#F4D77B]">
                    {cigar.upcCodes && cigar.upcCodes.length > 0 ? (
                      <span title={cigar.upcCodes.join(", ")}>
                        {cigar.upcCodes[0]}
                        {cigar.upcCodes.length > 1 && (
                          <span className="ml-1 rounded bg-[#D6AA50]/20 px-1 py-0.5 text-[10px] text-[#D6AA50]">
                            +{cigar.upcCodes.length - 1}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[#9A8060]">—</span>
                    )}
                  </td>
                  <Cell>{cigar.strength}</Cell>
                  <Cell>{cigar.wrapper}</Cell>
                  <td className="px-6 py-4 text-sm font-medium text-[#D6AA50]">
                    {typeof cigar.suggestedRetailPriceEach === "number"
                      ? `$${cigar.suggestedRetailPriceEach.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#D6AA50]">
                    {typeof cigar.suggestedRetailPricePerBox === "number"
                      ? `$${cigar.suggestedRetailPricePerBox.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={cigar.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-3 text-[#BFA98A]">
                      <Action label="View" onClick={() => setViewing(cigar)}>
                        <Eye />
                      </Action>
                      <Action
                        label="Edit"
                        onClick={() => {
                          setEditing(cigar);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil />
                      </Action>
                      <Action
                        label="Delete"
                        danger
                        onClick={() => setDeleting(cigar)}
                      >
                        <Trash2 />
                      </Action>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        limit={limit}
        total={query.data?.meta.total || 0}
        currentCount={cigars.length}
        onPageChange={setPage}
        disabled={query.isFetching}
      />
      <AddMasterDatabase
        open={formOpen}
        initial={editing}
        pending={saveMutation.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={(values) => saveMutation.mutate(values)}
      />
      <ViewMasterDatabase
        cigar={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      />
      <BulkUploadMasterDatabase
        open={bulkOpen}
        pending={bulkUploadMutation.isPending}
        onOpenChange={setBulkOpen}
        onSubmit={(file) => bulkUploadMutation.mutate(file)}
      />
      <DeleteModal
        open={Boolean(deleting)}
        title="Delete Product"
        itemName={deleting?.productLine || deleting?.name}
        description={
          deleting
            ? `Are you sure you want to delete ${deleting.productLine || deleting.name}? This action cannot be undone.`
            : undefined
        }
        disabled={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}

function RowMessage({ text, error }: { text: string; error?: boolean }) {
  return (
    <tr>
      <td
        colSpan={9}
        className={`px-6 py-14 text-center text-sm ${error ? "text-red-400" : "text-[#9A8060]"}`}
      >
        {text}
      </td>
    </tr>
  );
}
function Cell({
  children,
  capitalize,
}: {
  children?: React.ReactNode;
  capitalize?: boolean;
}) {
  return (
    <td
      className={`px-6 py-4 text-sm text-[#BFA98A] ${capitalize ? "capitalize" : ""}`}
    >
      {children || "—"}
    </td>
  );
}
function StatusBadge({ status = "active" }: { status?: string }) {
  const normalizedStatus = status.toLowerCase();
  const style =
    normalizedStatus === "active"
      ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
      : normalizedStatus === "inactive" ||
          normalizedStatus === "out_of_stock"
        ? "border-red-500/25 bg-red-950/60 text-red-400"
        : "border-amber-500/25 bg-amber-950/60 text-amber-400";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${style}`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}
function Action({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactElement<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`cursor-pointer p-1 ${danger ? "hover:text-red-400" : "hover:text-[#D6AA50]"}`}
    >
      {<span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{children}</span>}
    </button>
  );
}
