"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import ViewUserDetails, { type ManagedUser, UserStatusBadge } from "./ViewUserDetails";

interface UserListResponse {
  success: boolean;
  message?: string;
  meta?: { page: number; limit: number; total: number };
  data?: ManagedUser[];
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function ShowUserList() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>(urlRole || "all");
  const itemsPerPage = 10;

  useEffect(() => {
    const role = searchParams.get("role");
    if (role && ["all", "customer", "retailer", "admin"].includes(role)) {
      setRoleFilter(role);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const usersQuery = useQuery({
    queryKey: ["users", currentPage, itemsPerPage, searchTerm, roleFilter],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(itemsPerPage),
        page: String(currentPage),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (searchTerm) params.set("searchTerm", searchTerm);
      if (roleFilter !== "all") params.set("role", roleFilter);

      const response = await fetch(`${getApiBaseUrl()}/user?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response.json().catch(() => null)) as UserListResponse | null;
      if (!response.ok || !result?.success || !Array.isArray(result.data) || !result.meta) {
        throw new Error(result?.message || "Unable to load users.");
      }
      return { users: result.data, meta: result.meta };
    },
  });

  const users = usersQuery.data?.users ?? [];
  const total = usersQuery.data?.meta.total ?? 0;
  const isLoading = sessionStatus === "loading" || usersQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-[360px]">
          <Input
            type="search"
            placeholder="Search name, email, role or status..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label="Search users"
            className="h-10 w-full rounded-lg border border-[#CBA24A]/30 bg-[#1C120C]/90 pl-10 pr-4 text-xs text-[#F7E4B3] placeholder:text-stone-600 focus:border-[#CBA24A]/80 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg border border-[#CBA24A]/30 bg-[#1C120C]/80 p-1">
          {[
            { label: "All Roles", value: "all" },
            { label: "Customers", value: "customer" },
            { label: "Retailers", value: "retailer" },
            { label: "Admins", value: "admin" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setRoleFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                roleFilter === tab.value
                  ? "bg-[#D6AA50] text-[#24170E] font-semibold"
                  : "text-[#CDB37A] hover:bg-[#342315] hover:text-[#F7E4B3]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-[#CBA24A]/45">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead className="bg-[#1B1009]">
            <tr>
              {roleFilter === "customer" ? (
                <>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Consumer</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Location</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Joined</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Status</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Actions</th>
                </>
              ) : roleFilter === "retailer" ? (
                <>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Retailer</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Business Name</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Verification</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Joined</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Status</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Actions</th>
                </>
              ) : roleFilter === "admin" ? (
                <>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Admin User</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Role</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Joined</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Status</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">User</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Role</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Info / Business</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Joined</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Status</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CBA24A]/40 bg-[#342315]/55">
            {isLoading ? (
              <tr><td colSpan={6} className="h-28 px-5 text-center text-xs text-[#9A8060]">Loading users...</td></tr>
            ) : usersQuery.isError ? (
              <tr><td colSpan={6} className="h-28 px-5 text-center text-xs text-red-400">{usersQuery.error.message}</td></tr>
            ) : !accessToken ? (
              <tr><td colSpan={6} className="h-28 px-5 text-center text-xs text-red-400">You are not authorized.</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="h-28 px-5 text-center text-xs text-[#9A8060]">No users found.</td></tr>
            ) : (
              users.map((user) => {
                const userRole = user.role?.toLowerCase();
                const isCustomer = userRole === "customer";
                const isRetailer = userRole === "retailer";

                return (
                  <tr key={user._id} className="h-[66px] transition-colors hover:bg-[#4A301D]/60">
                    <td className="px-5 py-3">
                      <p className="text-xs font-medium text-[#F7E4B3]">{user.fullName || (isCustomer ? "Consumer" : "—")}</p>
                      <p className="mt-0.5 text-[9px] text-[#9A8060]">{user.email || "—"}</p>
                    </td>

                    {roleFilter === "customer" ? (
                      <>
                        <td className="px-5 py-3 text-xs text-[#BFA98A]">
                          {[user.city, user.country].filter(Boolean).join(", ") || user.address || "Consumer App"}
                        </td>
                        <td className="px-5 py-3 text-xs text-[#BFA98A]">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><UserStatusBadge status={user.status} /></td>
                      </>
                    ) : roleFilter === "retailer" ? (
                      <>
                        <td className="px-5 py-3 text-xs text-[#BFA98A]">{user.businessName || "—"}</td>
                        <td className="px-5 py-3 text-xs">
                          <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-medium capitalize ${
                            user.verfied === "verified" ? "bg-emerald-900/50 text-emerald-300" : "bg-amber-900/40 text-amber-300"
                          }`}>
                            {user.verfied || "unverified"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#BFA98A]">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><UserStatusBadge status={user.status} /></td>
                      </>
                    ) : roleFilter === "admin" ? (
                      <>
                        <td className="px-5 py-3 text-xs font-semibold text-[#D6AA50]">Admin</td>
                        <td className="px-5 py-3 text-xs text-[#BFA98A]">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><UserStatusBadge status={user.status} /></td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 text-xs capitalize text-[#BFA98A]">
                          <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-medium ${
                            isCustomer ? "bg-sky-950/60 text-sky-300" : isRetailer ? "bg-amber-950/60 text-amber-300" : "bg-purple-950/60 text-purple-300"
                          }`}>
                            {user.role || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#BFA98A]">
                          {isRetailer ? (user.businessName || "Retailer Store") : isCustomer ? ([user.city, user.country].filter(Boolean).join(", ") || "Consumer Account") : "Administrator"}
                        </td>
                        <td className="px-5 py-3 text-xs text-[#BFA98A]">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><UserStatusBadge status={user.status} /></td>
                      </>
                    )}

                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(user._id)}
                        title="View User Details"
                        aria-label={`View ${user.fullName}`}
                        className="cursor-pointer p-1 text-[#CBA24A] transition-colors hover:text-[#F7D77F]"
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
        page={currentPage}
        limit={itemsPerPage}
        total={total}
        currentCount={users.length}
        onPageChange={setCurrentPage}
        disabled={usersQuery.isFetching}
      />

      <ViewUserDetails
        open={selectedUserId !== null}
        userId={selectedUserId}
        accessToken={accessToken}
        onOpenChange={(open) => { if (!open) setSelectedUserId(null); }}
      />
    </div>
  );
}
