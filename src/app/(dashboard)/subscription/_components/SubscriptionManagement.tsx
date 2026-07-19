"use client";

import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import DetaislSubscriptionModal, { type Subscription, SubscriptionStatusBadge } from "./DetaislSubscriptionModal";

const subscriptions: Subscription[] = [
  { id: 1, name: "Marco Delgado", email: "marco@casadelhabano.com", role: "Retailer", business: "Casa del Habano NYC", plan: "Monthly", price: "$700", expiryDate: "Jul 7, 2025", status: "Active" },
  { id: 2, name: "James Whitfield", email: "james@thecigarhouse.com", role: "Retailer", business: "The Cigar House", plan: "Monthly", price: "$700", expiryDate: "Jul 6, 2025", status: "Active" },
  { id: 3, name: "Sofia Reyes", email: "sofia@humidor411.com", role: "Retailer", business: "Casa del Habano NYC", plan: "Monthly", price: "$700", expiryDate: "Jul 7, 2025", status: "Active" },
  { id: 4, name: "Rebecca Harmon", email: "rebecca@churchills.com", role: "Retailer", business: "Churchill's Fine Cigars", plan: "Monthly", price: "$700", expiryDate: "Jun 18, 2025", status: "Expired" },
  { id: 5, name: "David Chen", email: "david@smokelounge.com", role: "Retailer", business: "The Smoke Lounge", plan: "Monthly", price: "$700", expiryDate: "Jul 5, 2025", status: "Active" },
  { id: 6, name: "Elena Garcia", email: "elena@premiumleaf.com", role: "Retailer", business: "Premium Leaf Co.", plan: "Yearly", price: "$7,000", expiryDate: "Jun 30, 2026", status: "Active" },
  { id: 7, name: "Samuel Brooks", email: "samuel@royalcigars.com", role: "Customer", business: "Royal Cigars", plan: "Monthly", price: "$700", expiryDate: "Jul 2, 2025", status: "Active" },
  { id: 8, name: "Nadia Foster", email: "nadia@havanaclub.com", role: "Retailer", business: "Havana Club Boston", plan: "Monthly", price: "$700", expiryDate: "Jun 20, 2025", status: "Expired" },
  { id: 9, name: "Lucas Martin", email: "lucas@cigarroom.com", role: "Retailer", business: "Montecristo Room", plan: "Yearly", price: "$7,000", expiryDate: "May 29, 2026", status: "Active" },
  { id: 10, name: "Olivia Turner", email: "olivia@heritage.com", role: "Customer", business: "Heritage Cigars", plan: "Monthly", price: "$700", expiryDate: "Jul 1, 2025", status: "Active" },
  { id: 11, name: "Daniel Wilson", email: "daniel@signature.com", role: "Retailer", business: "Signature Cigars", plan: "Monthly", price: "$700", expiryDate: "Jun 15, 2025", status: "Expired" },
  { id: 12, name: "Maya Collins", email: "maya@reserve.com", role: "Customer", business: "Reserve Lounge", plan: "Yearly", price: "$7,000", expiryDate: "Apr 22, 2026", status: "Active" },
];

export default function SubscriptionManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const itemsPerPage = 5;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredSubscriptions = subscriptions.filter((subscription) =>
    [
      subscription.name,
      subscription.email,
      subscription.role,
      subscription.business,
      subscription.plan,
      subscription.status,
    ].some((value) => value.toLowerCase().includes(normalizedSearch)),
  );
  const visibleSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative w-full max-w-[360px]">
        <Input
          type="search"
          placeholder="Search subscriptions..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Search subscriptions"
          className="h-10 w-full rounded-lg border border-[#CBA24A]/30 bg-[#1C120C]/90 pl-10 pr-4 text-xs text-[#F7E4B3] placeholder:text-stone-600 focus:border-[#CBA24A]/80 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-[#CBA24A]/55">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead className="bg-[#1B1009]">
            <tr>{["User", "Role", "Business", "Plan", "Price", "Expire date", "Status", "Actions"].map((heading) => <th key={heading} className="px-5 py-4 text-[10px] font-semibold text-[#F7E4B3]">{heading}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#CBA24A]/45 bg-[#342315]/55">
            {visibleSubscriptions.map((subscription) => (
              <tr key={subscription.id} className="h-[60px] transition-colors hover:bg-[#4A301D]/60">
                <td className="px-5 py-3"><p className="text-xs font-medium text-[#F7E4B3]">{subscription.name}</p><p className="mt-0.5 text-[9px] text-[#9A8060]">{subscription.email}</p></td>
                <td className="px-5 py-3 text-xs text-[#BFA98A]">{subscription.role}</td>
                <td className="max-w-[165px] truncate px-5 py-3 text-xs text-[#BFA98A]" title={subscription.business}>{subscription.business}</td>
                <td className="px-5 py-3 text-xs text-[#BFA98A]">{subscription.plan}</td>
                <td className="px-5 py-3 text-xs text-[#BFA98A]">{subscription.price}</td>
                <td className="px-5 py-3 text-xs text-[#BFA98A]">{subscription.expiryDate}</td>
                <td className="px-5 py-3"><SubscriptionStatusBadge status={subscription.status} /></td>
                <td className="px-5 py-3"><button type="button" onClick={() => setSelectedSubscription(subscription)} title="View Subscription" aria-label={`View ${subscription.name}'s subscription`} className="cursor-pointer p-1 text-[#CBA24A] transition-colors hover:text-[#F7D77F]"><Eye className="h-[18px] w-[18px]" /></button></td>
              </tr>
            ))}
            {visibleSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={8} className="h-28 px-5 text-center text-xs text-[#9A8060]">
                  No subscriptions found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={currentPage} limit={itemsPerPage} total={filteredSubscriptions.length} currentCount={visibleSubscriptions.length} onPageChange={setCurrentPage} />
      <DetaislSubscriptionModal open={selectedSubscription !== null} subscription={selectedSubscription} onOpenChange={(open) => { if (!open) setSelectedSubscription(null); }} />
    </div>
  );
}
