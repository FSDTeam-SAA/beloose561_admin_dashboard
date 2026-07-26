"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPageConfig } from "@/lib/page-config";

interface HeaderProps { setSidebarOpen: (open: boolean) => void }

export default function Header({ setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const pageInfo = getPageConfig(pathname);
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; profileImage?: string } | undefined;
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AU";

  return <header className="fixed left-0 right-0 top-0 z-30 flex h-[100px] items-center justify-between border-b border-[#CBA24A]/10 bg-[#2A1E10] px-4 md:px-6">
    <div className="flex items-center gap-3">
      <button type="button" aria-label="Open navigation" className="cursor-pointer text-[#F7E4B3] lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
      <div className="lg:ml-[265px]"><h1 className="text-2xl font-bold leading-[150%] text-[#CD9B46]">{pageInfo.title}</h1><p className="hidden text-sm text-[#9A8060] md:block">{pageInfo.description}</p></div>
    </div>

    <div className="flex items-center gap-3 sm:gap-4">
      <button type="button" aria-label="Notifications" title="Notifications" className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#CBA24A]/20 bg-[#24180D] text-[#D6AA50] transition hover:border-[#D6AA50]/60 hover:bg-[#D6AA50]/10"><Bell className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-[#2A1E10] bg-red-500" /></button>
      <div className="h-9 w-px bg-[#CBA24A]/15" />
      <div className="flex min-w-0 items-center gap-3 rounded-lg px-1.5 py-1">
        <Avatar className="h-10 w-10 shrink-0 border border-[#CBA24A]/35"><AvatarImage src={user?.profileImage} alt={user?.name || "Admin profile"} className="object-cover" /><AvatarFallback className="bg-[#CBA24A]/20 text-xs font-semibold text-[#E5BE6A]">{initials}</AvatarFallback></Avatar>
        <div className="hidden min-w-0 sm:block"><p className="max-w-[170px] truncate text-sm font-semibold text-[#F5E7C8]">{user?.name || "Admin User"}</p><p className="max-w-[190px] truncate text-[11px] text-[#9A8060]">{user?.email || "admin@example.com"}</p></div>
      </div>
    </div>
  </header>;
}
