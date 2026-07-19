"use client";

import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPageConfig } from "@/lib/page-config";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const pageInfo = getPageConfig(pathname);

  const { data: session } = useSession();

  const user = session?.user as {
    email?: string;
  };

  const email = user?.email;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 left-0 z-30 h-[100px] flex items-center justify-between px-4 md:px-6 bg-[#2A1E10]">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>

        <div className="lg:ml-[265px]">
          <h1 className="text-2xl font-bold leading-[150%] text-[#CD9B46]">
            {pageInfo.title}
          </h1>

          <p className="hidden md:block text-sm text-[#6B7280]">
            {pageInfo.description}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="relative flex items-center">
        <div
          ref={avatarRef}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="hidden sm:block text-sm text-black">
            {email}
          </span>

          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="text-black">TA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}