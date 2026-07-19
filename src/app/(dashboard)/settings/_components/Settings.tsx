"use client";

import React, { useState } from "react";
import { ChevronLeft, KeyRound, UserRound } from "lucide-react";
import PersonalInfo from "./PersonalInfo";
import ChangePassword from "./ChangePassword";

type SettingsView = "menu" | "profile" | "password";

function Settings() {
  const [view, setView] = useState<SettingsView>("menu");

  if (view !== "menu") {
    return (
      <section className="min-h-[calc(100vh-132px)]">
        <button
          type="button"
          onClick={() => setView("menu")}
          className="group mb-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#CBA24A]/35 bg-[#2B1D12]/55 px-3 text-sm font-medium text-[#BFA98A] transition-all duration-200 hover:border-[#D6AA50] hover:bg-[#D6AA50]/12 hover:text-[#F7E4B3] hover:shadow-[0_0_14px_rgba(214,170,80,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6AA50]/40"
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Settings
        </button>
        {view === "profile" ? <PersonalInfo /> : <ChangePassword />}
      </section>
    );
  }

  return (
    <section className="">
      <SettingsLink
        icon={<UserRound className="h-4 w-4" />}
        label="Profile"
        onClick={() => setView("profile")}
      />
      <SettingsLink
        icon={<KeyRound className="h-4 w-4" />}
        label="Password"
        onClick={() => setView("password")}
      />
    </section>
  );
}

function SettingsLink({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded  bg-[#332211] px-5 py-5 text-left text-sm font-semibold text-white shadow-[0px_4px_6px_0px_#F7E4B31A] transition-all hover:border-[#CD9B46]/50 hover:bg-[#332211] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CD9B46]/30 mb-10"
    >
      {icon}
      {label}
    </button>
  );
}

export default Settings;
