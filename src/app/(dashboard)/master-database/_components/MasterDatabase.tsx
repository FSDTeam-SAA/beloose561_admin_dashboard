"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import AddMasterDatabase, { type CigarFormValues } from "./AddMasterDatabase";
import ViewMasterDatabase from "./ViewMasterDatabase";

export interface Cigar {
  _id: string;
  name: string;
  brand: string;
  productLine?: string;
  manufacturer?: string;
  country?: string;
  wrapper?: string;
  binder?: string;
  filler?: string;
  strength?: string;
  size?: string;
  ringGauge?: number;
  length?: string;
  flavorNotes?: string[];
  smokingTime?: string;
  image?: string;
  description?: string;
  whyYoullLikeThis?: string;
  priceRange?: string;
  category?: string;
  status?: string;
  submittedByRetailer?: string;
  createdAt: string;
  updatedAt?: string;
}
interface ApiResponse {
  success: boolean;
  message?: string;
  meta?: { page: number; limit: number; total: number };
  data?: Cigar[] | Cigar;
}
const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
};

export default function MasterDatabase() {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
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
      const body = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === "") return;
        body.append(
          key,
          Array.isArray(value) ? value.join(",") : String(value),
        );
      });
      const response = await fetch(
        editing
          ? `${getApiBaseUrl()}/master-database/master-database/${editing._id}`
          : `${getApiBaseUrl()}/master-database`,
        {
          method: editing ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as ApiResponse | null;
      if (!response.ok || !result?.success)
        throw new Error(
          result?.message || `Unable to ${editing ? "update" : "add"} product.`,
        );
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
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#D6AA50] px-5 text-xs font-semibold text-[#2B1B10] hover:bg-[#E7BF69]"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
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
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead className="bg-[#1B1009]">
            <tr>
              {[
                "Brand",
                "Product Line",
                "Wrapper",
                "Strength",
                "Size",
                "Price",
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
              cigars.map((cigar) => (
                <tr key={cigar._id} className="h-[66px] hover:bg-[#4A301D]/45">
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium text-[#F7E4B3]">
                      {cigar.brand || "—"}
                    </p>
                    <p className="mt-1 text-xs text-[#9A8060]">
                      {cigar.name || "—"}
                    </p>
                  </td>
                  <Cell>{cigar.productLine}</Cell>
                  <Cell>{cigar.wrapper}</Cell>
                  <Cell capitalize>{cigar.strength}</Cell>
                  <Cell>{cigar.size}</Cell>
                  <td className="px-6 py-4 text-sm font-medium text-[#D6AA50]">
                    {cigar.priceRange || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Status status={cigar.status} />
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
      <DeleteModal
        open={Boolean(deleting)}
        title="Delete Product"
        itemName={deleting?.name}
        description={
          deleting
            ? `Are you sure you want to delete ${deleting.name}? This action cannot be undone.`
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
        colSpan={8}
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
function Status({ status }: { status?: string }) {
  const value = status?.toLowerCase() || "pending";
  const style =
    value === "approved"
      ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400"
      : value === "denied" || value === "rejected"
        ? "border-red-500/25 bg-red-950/60 text-red-400"
        : "border-amber-500/25 bg-amber-950/60 text-amber-400";
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] capitalize ${style}`}
    >
      {value}
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
