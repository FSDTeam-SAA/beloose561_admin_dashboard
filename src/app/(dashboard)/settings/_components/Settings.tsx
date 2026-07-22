"use client";

import { useState, type ReactNode } from "react";
import { Bell, Globe2 } from "lucide-react";

type SettingKey =
  | "productSubmissions"
  | "retailerSignups"
  | "approvalReminders"
  | "autoApprove"
  | "selfSignup"
  | "maintenance";

const notificationSettings: Array<{
  key: SettingKey;
  title: string;
  description: string;
}> = [
  {
    key: "productSubmissions",
    title: "New Product Submissions",
    description: "Get notified when retailers submit products for review",
  },
  {
    key: "retailerSignups",
    title: "New Retailer Signups",
    description: "Notify when a new retailer registers",
  },
  {
    key: "approvalReminders",
    title: "Pending Approval Reminders",
    description: "Daily summary of products awaiting review",
  },
];

const platformSettings: Array<{
  key: SettingKey;
  title: string;
  description: string;
}> = [
  {
    key: "autoApprove",
    title: "Auto-Approve Known Products",
    description:
      "Automatically approve products matching existing master database entries",
  },
  {
    key: "selfSignup",
    title: "Allow Retailer Self-Signup",
    description: "Let new retailers register without admin invitation",
  },
  {
    key: "maintenance",
    title: "Maintenance Mode",
    description: "Temporarily disable customer access for updates",
  },
];

export default function Settings() {
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
    productSubmissions: true,
    retailerSignups: true,
    approvalReminders: true,
    autoApprove: false,
    selfSignup: true,
    maintenance: false,
  });

  const toggle = (key: SettingKey) =>
    setSettings((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="flex w-full flex-col gap-6">
      <SettingsSection icon={<Bell />} title="Admin Notifications">
        {notificationSettings.map(({ key, ...item }) => (
          <SettingRow
            key={key}
            {...item}
            checked={settings[key]}
            onChange={() => toggle(key)}
          />
        ))}
      </SettingsSection>

      <SettingsSection icon={<Globe2 />} title="Platform Settings">
        {platformSettings.map(({ key, ...item }) => (
          <SettingRow
            key={key}
            {...item}
            checked={settings[key]}
            onChange={() => toggle(key)}
          />
        ))}
      </SettingsSection>
    </div>
  );
}

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#CBA24A]/25 bg-[#241910]/45 px-5 py-5 shadow-[0_10px_35px_rgba(0,0,0,.08)] sm:px-6">
      <div className="mb-4 flex items-center gap-2.5 text-[#D6AA50]">
        <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
        <h2 className="font-serif text-xl font-normal text-[#F7E4B3]">
          {title}
        </h2>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-6 rounded-lg px-0 transition-colors hover:bg-[#D6AA50]/[0.035] sm:px-0">
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-[#F7E4B3]">{title}</h3>
        <p className="mt-0.5 text-xs leading-4 text-[#9A8060]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6AA50]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B1009] ${checked ? "border-[#D6AA50] bg-[#D6AA50]" : "border-[#705929]/50 bg-[#3A2A1D]"}`}
      >
        <span
          className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-[#FFF8EA] shadow-sm transition-all duration-200 ${checked ? "left-[21px]" : "left-[2px]"}`}
        />
      </button>
    </div>
  );
}
