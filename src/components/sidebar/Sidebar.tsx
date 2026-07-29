"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarRange,
  ChevronDown,
  ClipboardCheck,
  Database,
  FileText,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings as SettingsIcon,
  Sparkles,
  Store,
  UserCog,
  Workflow,
  X,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileSummary } from "@/hooks/use-profile-summary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Dashboard Overview", href: "/", icon: LayoutDashboard },
  {
    name: "Retailer Management",
    href: "/retailer-management",
    icon: Store,
  },
  {
    name: "Master Database",
    href: "/master-database",
    icon: Database,
  },
  {
    name: "Product Approval",
    href: "/product-approval",
    icon: ClipboardCheck,
  },
  // {
  //   name: "User Management",
  //   href: "/user-management",
  //   icon: MapPin,
  // },
  {
    name: "Subscription",
    href: "/subscription",
    icon: CalendarRange,
  },
  {
    name: "Payment History",
    href: "/payment-history",
    icon: ReceiptText,
  },
  {
    name: "Homepage Settings",
    icon: SettingsIcon,
    children: [
      {
        name: "Banner",
        href: "/home-settings/banner",
        icon: ImageIcon,
      },
      {
        name: "For Retailers",
        href: "/home-settings/for-retailers",
        icon: FileText,
      },
      {
        name: "The Platform",
        href: "/home-settings/the-platform",
        icon: Sparkles,
      },
      {
        name: "How It Works",
        href: "/home-settings/how-it-works",
        icon: Workflow,
      },
    ],
  },
  {
    name: "Profile Info",
    href: "/profile",
    icon: UserCog,
  },
  {
    name: "Change Password",
    href: "/chg-password",
    icon: KeyRound,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [homepageOpen, setHomepageOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const user = useProfileSummary();
  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  useEffect(() => {
    const syncSection = () =>
      setActiveSection(new URLSearchParams(window.location.search).get("section") || "");
    syncSection();
    window.addEventListener("popstate", syncSection);
    return () => window.removeEventListener("popstate", syncSection);
  }, [pathname]);

  useEffect(() => {
    const isHomepageChild = navigation.some(
      (item) =>
        "children" in item &&
        item.children?.some((child) => {
          const [childPath, childQuery] = child.href.split("?");
          if (pathname !== childPath) return false;
          if (!childQuery) return true;
          const expectedSection = new URLSearchParams(childQuery).get("section");
          return activeSection === expectedSection;
        }),
    );
    if (isHomepageChild) setHomepageOpen(true);
  }, [activeSection, pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-[280px] lg:w-[320px] bg-[#2A1E10] z-50 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile Close Button */}
        <div className="absolute right-4 top-4 lg:hidden">
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex h-[104px] shrink-0 items-center justify-center">
          <Image
            src="/images/humidor-logo2.png"
            alt="Humidor logo"
            width={78}
            height={74}
            priority
            className="h-[74px] w-[78px] object-contain drop-shadow-[0_4px_8px_rgba(205,155,70,0.25)]"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 flex flex-col items-center px-3 overflow-y-auto">
          {navigation.map((item) => {
            if ("children" in item && item.children) {
              const isChildActive = item.children.some(
                (child) => {
                  const [childPath, childQuery] = child.href.split("?");
                  if (pathname !== childPath) return false;
                  if (!childQuery) return true;
                  const expectedSection = new URLSearchParams(childQuery).get(
                    "section",
                  );
                  return activeSection === expectedSection;
                },
              );

              return (
                <div key={item.name} className="w-full">
                  <button
                    type="button"
                    onClick={() => setHomepageOpen((value) => !value)}
                    aria-expanded={homepageOpen}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-[4px] px-4 py-[11px] text-sm font-medium transition-all duration-200",
                      isChildActive
                        ? "bg-[linear-gradient(91.71deg,_#CBA24A4D_0.08%,_#CBA24A33_99.92%)] text-white border-l-[3px]"
                        : "text-[#9A8060] hover:bg-slate-200",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isChildActive ? "text-white" : "text-[#9A8060]",
                      )}
                    />
                    <span
                      className={cn(
                        "flex-1 text-left text-base",
                        isChildActive ? "font-semibold" : "text-[#9A8060]",
                      )}
                    >
                      {item.name}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        homepageOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {homepageOpen && (
                    <div className="mt-1 space-y-1 pl-7">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const [childPath, childQuery] = child.href.split("?");
                        const expectedSection = childQuery
                          ? new URLSearchParams(childQuery).get("section")
                          : null;
                        const childIsActive =
                          pathname === childPath &&
                          (!childQuery ||
                            activeSection === expectedSection);
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => {
                              setActiveSection(expectedSection || "");
                              setOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-[4px] border-l-2 px-4 py-2 text-sm transition-colors",
                              childIsActive
                                ? "border-[#D6AA50] bg-[#CBA24A]/20 font-semibold text-[#F7E4B3]"
                                : "border-transparent text-[#9A8060] hover:bg-[#CBA24A]/10 hover:text-[#F7E4B3]",
                            )}
                          >
                            <ChildIcon
                              className={cn(
                                "h-4 w-4",
                                childIsActive && "text-[#D6AA50]",
                              )}
                            />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[4px] px-4 py-[11px] text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[linear-gradient(91.71deg,_#CBA24A4D_0.08%,_#CBA24A33_99.92%)] text-white border-l-[3px] "
                    : "text-[#616161] hover:bg-slate-200",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-[#9A8060]",
                  )}
                />

                <span
                  className={cn(
                    "text-base",
                    isActive ? "font-semibold" : "text-[#9A8060]",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User profile and logout */}
        <div className="shrink-0 bg-[#24180D] px-5 py-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-[#CBA24A]/30">
              <AvatarImage
                src={user.image}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-[#CBA24A]/20 text-xs font-semibold text-[#E5BE6A]">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#F5E7C8]">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-[#9A8060]">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] border border-[#D83939] text-sm font-medium text-[#F04444] transition-colors duration-200 hover:bg-[#D83939] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D83939]/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      <Dialog
        open={logoutOpen}
        onOpenChange={(value) => !isLoggingOut && setLogoutOpen(value)}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-black/70 backdrop-blur-sm"
          className="w-[calc(100%-2rem)] max-w-[430px] gap-5 rounded-xl border border-[#CBA24A]/20 bg-[#2A1E10] p-6 text-[#F7E4B3] shadow-[0_24px_80px_rgba(0,0,0,.7)]"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal text-[#F7E4B3]">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#BFA98A]">
              Are you sure you want to log out of your admin account?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => setLogoutOpen(false)}
              className="h-10 cursor-pointer rounded-lg border border-[#CBA24A]/35 text-xs font-medium hover:bg-[#CBA24A]/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={async () => {
                setIsLoggingOut(true);
                await signOut({ callbackUrl: "/signin" });
              }}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
