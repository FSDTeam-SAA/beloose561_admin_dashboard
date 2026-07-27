"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bell, Globe2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type SettingKey =
  | "newProductSubmissions"
  | "newRetailerSignups"
  | "pendingApprovalReminders"
  | "retailerApprovalNotifications"
  | "productApprovalNotifications"
  | "subscriptionExpiryNotifications"
  | "allowRetailerSelfSignup";

type SettingsData = Record<SettingKey, boolean>;

interface SettingsResponse {
  success: boolean;
  message?: string;
  data?: SettingsData;
}

const defaultSettings: SettingsData = {
  newProductSubmissions: true,
  newRetailerSignups: true,
  pendingApprovalReminders: true,
  retailerApprovalNotifications: true,
  productApprovalNotifications: true,
  subscriptionExpiryNotifications: true,
  allowRetailerSelfSignup: true,
};

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

const notificationSettings: Array<{
  key: SettingKey;
  title: string;
  description: string;
}> = [
  {
    key: "newProductSubmissions",
    title: "New Product Submissions",
    description: "Get notified when retailers submit products for review",
  },
  {
    key: "newRetailerSignups",
    title: "New Retailer Signups",
    description: "Notify when a new retailer registers",
  },
  {
    key: "pendingApprovalReminders",
    title: "Pending Approval Reminders",
    description: "Daily summary of products awaiting review",
  },
  {
    key: "retailerApprovalNotifications",
    title: "Retailer Approval Notifications",
    description: "Get notified when retailer approval status changes",
  },
  {
    key: "productApprovalNotifications",
    title: "Product Approval Notifications",
    description: "Get notified when submitted products are reviewed",
  },
  {
    key: "subscriptionExpiryNotifications",
    title: "Subscription Expiry Notifications",
    description: "Receive alerts when retailer subscriptions are expiring",
  },
];

const platformSettings: Array<{
  key: SettingKey;
  title: string;
  description: string;
}> = [
  {
    key: "allowRetailerSelfSignup",
    title: "Allow Retailer Self-Signup",
    description: "Let new retailers register without admin invitation",
  },
];

export default function Settings() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/settings`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as SettingsResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to load settings.");
      }
      return result.data;
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    setSettings({
      newProductSubmissions:
        settingsQuery.data.newProductSubmissions ?? true,
      newRetailerSignups: settingsQuery.data.newRetailerSignups ?? true,
      pendingApprovalReminders:
        settingsQuery.data.pendingApprovalReminders ?? true,
      retailerApprovalNotifications:
        settingsQuery.data.retailerApprovalNotifications ?? true,
      productApprovalNotifications:
        settingsQuery.data.productApprovalNotifications ?? true,
      subscriptionExpiryNotifications:
        settingsQuery.data.subscriptionExpiryNotifications ?? true,
      allowRetailerSelfSignup:
        settingsQuery.data.allowRetailerSelfSignup ?? true,
    });
  }, [settingsQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async (nextSettings: SettingsData) => {
      if (!accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(`${getApiBaseUrl()}/settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextSettings),
      });
      const result = (await response
        .json()
        .catch(() => null)) as SettingsResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to update settings.");
      }
      return result;
    },
    onSuccess: async (result) => {
      if (result.data) setSettings(result.data);
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(result.message || "Settings updated successfully.");
    },
    onError: (error: unknown) => {
      if (settingsQuery.data) setSettings(settingsQuery.data);
      toast.error(
        error instanceof Error ? error.message : "Unable to update settings.",
      );
    },
  });

  const toggle = (key: SettingKey) => {
    const nextSettings = { ...settings, [key]: !settings[key] };
    setSettings(nextSettings);
    updateMutation.mutate(nextSettings);
  };

  if (sessionStatus === "loading" || settingsQuery.isLoading) {
    return <StateMessage text="Loading settings..." />;
  }
  if (!accessToken) {
    return <StateMessage text="You are not authorized." error />;
  }
  if (settingsQuery.isError) {
    return <StateMessage text={settingsQuery.error.message} error />;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <SettingsSection icon={<Bell />} title="Admin Notifications">
        {notificationSettings.map(({ key, ...item }) => (
          <SettingRow
            key={key}
            {...item}
            checked={settings[key]}
            disabled={updateMutation.isPending}
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
            disabled={updateMutation.isPending}
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
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
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
        disabled={disabled}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6AA50]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B1009] disabled:cursor-not-allowed disabled:opacity-60 ${checked ? "border-[#D6AA50] bg-[#D6AA50]" : "border-[#705929]/50 bg-[#3A2A1D]"}`}
      >
        <span
          className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-[#FFF8EA] shadow-sm transition-all duration-200 ${checked ? "left-[21px]" : "left-[2px]"}`}
        />
      </button>
    </div>
  );
}

function StateMessage({ text, error }: { text: string; error?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-[#CBA24A]/25 bg-[#241910]/45 px-5 py-16 text-center text-sm ${error ? "text-red-400" : "text-[#BFA98A]"}`}
    >
      {text}
    </div>
  );
}
