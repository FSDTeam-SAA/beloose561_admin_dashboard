"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Pencil } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ProfileSummaryCard from "./ProfileSummaryCard";

export interface SettingsProfile {
  _id: string;
  fullName: string;
  businessName?: string;
  email: string;
  role?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  status?: string;
  verfied?: string;
  isSubscription?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileResponse {
  success?: boolean;
  message?: string;
  data?: SettingsProfile;
}
interface FormState {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
}
const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  businessName: "",
  email: "",
  phoneNumber: "",
  gender: "",
  dateOfBirth: "",
  address: "",
};

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

function toForm(user: SettingsProfile): FormState {
  const [firstName = "", ...lastName] = (user.fullName || "")
    .trim()
    .split(/\s+/);
  return {
    firstName,
    lastName: lastName.join(" "),
    businessName: user.businessName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth?.slice(0, 10) || "",
    address: user.address || "",
  };
}

export default function PersonalInfo() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File>();
  const [imagePreview, setImagePreview] = useState("");

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (!response.ok || !result?.success || !result.data)
        throw new Error(result?.message || "Unable to load profile.");
      return result.data;
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    setForm(toForm(profileQuery.data));
    setImagePreview(profileQuery.data.profilePicture || "");
    setImageFile(undefined);
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      const body = new FormData();
      body.append(
        "fullName",
        `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      );
      body.append("businessName", form.businessName.trim());
      body.append("phoneNumber", form.phoneNumber.trim());
      body.append("address", form.address.trim());
      if (form.gender) body.append("gender", form.gender);
      if (form.dateOfBirth) body.append("dateOfBirth", form.dateOfBirth);
      if (imageFile) body.append("profilePicture", imageFile, imageFile.name);
      const response = await fetch(`${getApiBaseUrl()}/user/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
      });
      const result = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (!response.ok || !result?.success || !result.data)
        throw new Error(result?.message || "Unable to update profile.");
      return result;
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Profile updated successfully.");
      setEditing(false);
      setImageFile(undefined);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to update profile.",
      ),
  });

  const user = profileQuery.data;
  const disabled = profileQuery.isLoading || updateMutation.isPending;
  const fullName = `${form.firstName} ${form.lastName}`.trim() || "Admin User";
  const inputClass =
    "h-10 w-full rounded-lg border border-[#CBA24A]/25 bg-[#342315]/60 px-3 text-sm text-[#F7E4B3] outline-none placeholder:text-[#9A8060] focus:border-[#D6AA50] disabled:cursor-not-allowed disabled:opacity-65";
  const setValue = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const discard = () => {
    if (!user) return;
    setForm(toForm(user));
    setImagePreview(user.profilePicture || "");
    setImageFile(undefined);
    setEditing(false);
  };
  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setEditing(true);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.firstName.trim()) return toast.error("First name is required.");
    updateMutation.mutate();
  };

  if (!accessToken)
    return <StateMessage text="You are not authorized." error />;
  if (profileQuery.isLoading) return <StateMessage text="Loading profile..." />;
  if (profileQuery.isError)
    return <StateMessage text={profileQuery.error.message} error />;

  return (
    <div className="space-y-4">
      <ProfileSummaryCard
        name={fullName}
        email={form.email}
        phone={form.phoneNumber}
        location={form.address}
        since={user?.createdAt}
        image={imagePreview}
        disabled={disabled}
        onImageChange={handleImage}
      />
      <form onSubmit={submit} className="space-y-4">
        <section className="rounded-xl border border-[#CBA24A]/20 bg-[#342315]/45 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F7E4B3]">
                Personal Information
              </h2>
              <p className="mt-1 text-xs text-[#9A8060]">
                Manage your admin profile details
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit profile"
              className="cursor-pointer rounded-md p-2 text-[#D6AA50] hover:bg-[#D6AA50]/10"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name">
              <input
                value={form.firstName}
                disabled={disabled || !editing}
                onChange={(event) => setValue("firstName", event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Last Name">
              <input
                value={form.lastName}
                disabled={disabled || !editing}
                onChange={(event) => setValue("lastName", event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Business Name">
              <input
                value={form.businessName}
                disabled={disabled || !editing}
                onChange={(event) =>
                  setValue("businessName", event.target.value)
                }
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                disabled
                className={inputClass}
              />
            </Field>
            <Field label="Phone Number">
              <input
                type="tel"
                value={form.phoneNumber}
                disabled={disabled || !editing}
                onChange={(event) =>
                  setValue("phoneNumber", event.target.value)
                }
                placeholder="Enter phone number"
                className={inputClass}
              />
            </Field>
            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dateOfBirth}
                disabled={disabled || !editing}
                onChange={(event) =>
                  setValue("dateOfBirth", event.target.value)
                }
                className={inputClass}
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                disabled={disabled || !editing}
                onChange={(event) => setValue("gender", event.target.value)}
                className={inputClass}
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
            <Field label="Role">
              <input
                value={user?.role || "—"}
                disabled
                className={`${inputClass} capitalize`}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea
                  value={form.address}
                  disabled={disabled || !editing}
                  onChange={(event) => setValue("address", event.target.value)}
                  placeholder="Enter your address"
                  className={`${inputClass} h-20 resize-none py-3`}
                />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <Badge
                label={user?.status || "unknown"}
                positive={user?.status === "active"}
              />
              <Badge
                label={user?.verfied || "pending"}
                positive={user?.verfied === "verified"}
              />
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={discard}
                  disabled={disabled}
                  className="h-10 cursor-pointer rounded-lg border border-[#CBA24A]/40 px-4 text-xs hover:bg-[#D6AA50]/10 disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={disabled}
                  className="h-10 cursor-pointer rounded-lg bg-[#D6AA50] px-5 text-xs font-semibold text-[#2B1B10] hover:bg-[#E7BF69] disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-[11px] font-medium text-[#BFA98A]">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Badge({ label, positive }: { label: string; positive: boolean }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] capitalize ${positive ? "border-emerald-500/25 bg-emerald-950/60 text-emerald-400" : "border-amber-500/25 bg-amber-950/60 text-amber-400"}`}
    >
      {label}
    </span>
  );
}
function StateMessage({ text, error }: { text: string; error?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-[#CBA24A]/20 bg-[#342315]/45 px-5 py-16 text-center text-sm ${error ? "text-red-400" : "text-[#BFA98A]"}`}
    >
      {text}
    </div>
  );
}
