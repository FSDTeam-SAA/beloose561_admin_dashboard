"use client";

import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import ViewUserDetails, { type ManagedUser, UserStatusBadge } from "./ViewUserDetails";

const users: ManagedUser[] = [
  { id: 1, name: "Marco Delgado", email: "marco@casadelhabano.com", role: "Retailer", business: "Casa del Habano NYC", lastLogin: "Jul 7, 2025", status: "Active" },
  { id: 2, name: "James Whitfield", email: "james@thecigarhouse.com", role: "Retailer", business: "The Cigar House", lastLogin: "Jul 6, 2025", status: "Active" },
  { id: 3, name: "Sofia Reyes", email: "sofia@humidor411.com", role: "Retailer", business: "Casa del Habano NYC", lastLogin: "Jul 7, 2025", status: "Active" },
  { id: 4, name: "Rebecca Harmon", email: "rebecca@churchills.com", role: "Retailer", business: "Churchill's Fine Cigars", lastLogin: "Jun 18, 2025", status: "Suspended" },
  { id: 5, name: "David Chen", email: "david@smokelounge.com", role: "Retailer", business: "The Smoke Lounge", lastLogin: "Jul 5, 2025", status: "Active" },
  { id: 6, name: "Elena Garcia", email: "elena@premiumleaf.com", role: "Retailer", business: "Premium Leaf Co.", lastLogin: "Jul 4, 2025", status: "Active" },
  { id: 7, name: "Samuel Brooks", email: "samuel@royalcigars.com", role: "Customer", business: "Royal Cigars", lastLogin: "Jul 2, 2025", status: "Active" },
  { id: 8, name: "Nadia Foster", email: "nadia@havanaclub.com", role: "Retailer", business: "Havana Club Boston", lastLogin: "Jun 30, 2025", status: "Suspended" },
  { id: 9, name: "Lucas Martin", email: "lucas@cigarroom.com", role: "Retailer", business: "Montecristo Room", lastLogin: "Jun 29, 2025", status: "Active" },
  { id: 10, name: "Olivia Turner", email: "olivia@heritage.com", role: "Customer", business: "Heritage Cigars", lastLogin: "Jun 27, 2025", status: "Active" },
  { id: 11, name: "Daniel Wilson", email: "daniel@signature.com", role: "Retailer", business: "Signature Cigars", lastLogin: "Jun 25, 2025", status: "Active" },
  { id: 12, name: "Maya Collins", email: "maya@reserve.com", role: "Customer", business: "Reserve Lounge", lastLogin: "Jun 22, 2025", status: "Active" },
];

export default function ShowUserList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const itemsPerPage = 5;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.role, user.business, user.status].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    ),
  );
  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative w-full max-w-[360px]">
        <Input
          type="search"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Search users"
          className="h-10 w-full rounded-lg border border-[#CBA24A]/30 bg-[#1C120C]/90 pl-10 pr-4 text-xs text-[#F7E4B3] placeholder:text-stone-600 focus:border-[#CBA24A]/80 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-[#CBA24A]/45">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead className="bg-[#1B1009]">
            <tr>
              {["User", "Role", "Business", "Last Login", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-5 py-3 text-[10px] font-semibold text-[#F7E4B3]">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CBA24A]/40 bg-[#342315]/55">
            {visibleUsers.map((user) => (
              <tr key={user.id} className="h-[66px] transition-colors hover:bg-[#4A301D]/60">
                <td className="px-5 py-3">
                  <p className="text-xs font-medium text-[#F7E4B3]">{user.name}</p>
                  <p className="mt-0.5 text-[9px] text-[#9A8060]">{user.email}</p>
                </td>
                <td className="px-5 py-3 text-xs text-[#BFA98A]">{user.role}</td>
                <td className="px-5 py-3 text-xs text-[#BFA98A]">{user.business}</td>
                <td className="px-5 py-3 text-xs text-[#BFA98A]">{user.lastLogin}</td>
                <td className="px-5 py-3"><UserStatusBadge status={user.status} /></td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    title="View User"
                    aria-label={`View ${user.name}`}
                    className="cursor-pointer p-1 text-[#CBA24A] transition-colors hover:text-[#F7D77F]"
                  >
                    <Eye className="h-[18px] w-[18px]" />
                  </button>
                </td>
              </tr>
            ))}
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-28 px-5 text-center text-xs text-[#9A8060]">
                  No users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} limit={itemsPerPage} total={filteredUsers.length} currentCount={visibleUsers.length} onPageChange={setCurrentPage} />

      <ViewUserDetails
        open={selectedUser !== null}
        user={selectedUser}
        onOpenChange={(open) => { if (!open) setSelectedUser(null); }}
      />
    </div>
  );
}
