"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import ProfileSummaryCard from "./ProfileSummaryCard";
import type { SettingsProfile } from "./PersonalInfo";

interface ChangePasswordResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
}

interface ProfileResponse {
  status?: boolean;
  success?: boolean;
  data?: SettingsProfile;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

function ChangePassword() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = (await response.json().catch(() => null)) as ProfileResponse | null;
      if (!response.ok || !data?.data) throw new Error("Unable to load profile.");
      return data.data;
    },
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as ChangePasswordResponse | null;

      if (!response.ok || data?.success === false || data?.status === false) {
        throw new Error(data?.message || "Unable to change password.");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password updated successfully.");
      reset();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    },
  });

  const checks = useMemo(
    () => [
      {
        text: "Minimum 8–12 characters (recommend 12+ for stronger security).",
        valid: newPassword.length >= 8,
      },
      {
        text: "At least one uppercase letter must.",
        valid: /[A-Z]/.test(newPassword),
      },
      {
        text: "At least one lowercase letter must.",
        valid: /[a-z]/.test(newPassword),
      },
      {
        text: "At least one number must (0–9).",
        valid: /\d/.test(newPassword),
      },
      {
        text: "At least special character (! @ # $ % ^ & * etc.).",
        valid: /[^A-Za-z0-9\s]/.test(newPassword),
      },
      {
        text: "No spaces allowed.",
        valid: newPassword.length > 0 && !/\s/.test(newPassword),
      },
    ],
    [newPassword],
  );

  const valid =
    currentPassword.length > 0 &&
    checks.every((check) => check.valid) &&
    newPassword === confirmPassword;
  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    if (!accessToken) return toast.error("You are not authorized.");
    changePasswordMutation.mutate();
  };

  const profile = profileQuery.data;

  return (
    <div className="space-y-4">
      <ProfileSummaryCard
        name={profile?.name || session?.user?.name || "User"}
        email={profile?.email || session?.user?.email || "N/A"}
        phone={profile?.phone}
        location={profile?.address?.cityState || profile?.address?.country}
        since={profile?.createdAt}
        image={profile?.profileImage}
      />
      <section className="rounded-lg border border-[#E7D8B8]/80 bg-[#523B21] p-4 sm:p-5">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={visible.current}
            disabled={changePasswordMutation.isPending}
            onToggle={() =>
              setVisible((state) => ({ ...state, current: !state.current }))
            }
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={visible.next}
            disabled={changePasswordMutation.isPending}
            onToggle={() =>
              setVisible((state) => ({ ...state, next: !state.next }))
            }
          />
          <div className="sm:col-span-2">
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={visible.confirm}
              disabled={changePasswordMutation.isPending}
              onToggle={() =>
                setVisible((state) => ({ ...state, confirm: !state.confirm }))
              }
            />
          </div>
        </div>

        <ul className="mt-5 space-y-2 text-[11px]">
          {checks.map((check) => (
            <li
              key={check.text}
              className={`flex items-center gap-1.5 ${newPassword && !check.valid ? "text-[#D6AA50]" : check.valid ? "text-[#9FB5A9]" : "text-[#A99476]"}`}
            >
              {check.valid ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {check.text}
            </li>
          ))}
          {confirmPassword && newPassword !== confirmPassword && (
            <li className="flex items-center gap-1.5 text-red-500">
              <X className="h-3 w-3" />
              Passwords do not match.
            </li>
          )}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={changePasswordMutation.isPending}
            className="h-9 min-w-[100px] cursor-pointer rounded-md border border-[#D6AA50] px-4 text-xs font-medium text-[#F7E4B3] hover:bg-[#D6AA50]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid || changePasswordMutation.isPending}
            className="h-9 min-w-[100px] cursor-pointer rounded-md bg-[#D6AA50] px-5 text-xs font-semibold text-[#3A2818] hover:bg-[#E7BF69] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {changePasswordMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
      </section>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  disabled = false,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block space-y-1.5 text-[11px] font-medium text-[#F7E4B3]">
      <span>{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`h-10 w-full rounded-md border bg-[#4B351F] px-3 pr-11 text-xs text-[#F7E4B3] outline-none transition-colors focus:border-[#D6AA50] disabled:cursor-not-allowed disabled:opacity-60 ${label.includes("Confirm") && value ? "border-red-600" : "border-[#E7D8B8]/80"}`}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#E7D8B8] hover:text-[#D6AA50] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </span>
    </label>
  );
}

export default ChangePassword;
