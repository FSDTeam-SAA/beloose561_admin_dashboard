"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ProfileSummaryCard from "./ProfileSummaryCard";

export interface SettingsProfile {
  _id: string;
  name: string;
  email: string;
  gender: string;
  phone?: string;
  profileImage: string;
  createdAt?: string;
  address?: {
    country?: string;
    cityState?: string;
    roadArea?: string;
    postalCode?: string;
  };
}

interface ProfileResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  data: SettingsProfile;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function PersonalInfo() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [streetAddress, setStreetAddress] = useState("");
  const [location, setLocation] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [nationality, setNationality] = useState("");
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File>();
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (
        !response.ok ||
        data?.success === false ||
        data?.status === false ||
        !data?.data
      )
        throw new Error(data?.message || "Unable to load profile.");
      return data.data;
    },
  });

  const populateForm = (user: SettingsProfile) => {
    const [first = "", ...rest] = (user.name || "").trim().split(/\s+/);
    setFirstName(first);
    setLastName(rest.join(" "));
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setGender(user.gender || "male");
    setStreetAddress(user.address?.roadArea || "");
    setLocation(user.address?.cityState || user.address?.country || "");
    setCountry(user.address?.country || "");
    setPostalCode(user.address?.postalCode || "");
    setProfileImagePreview(user.profileImage || "");
  };

  useEffect(() => {
    if (profileQuery.data) {
      populateForm(profileQuery.data);
      setProfileImageFile(undefined);
    }
  }, [profileQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          gender,
          phone: phone.trim(),
          address: {
            roadArea: streetAddress.trim(),
            cityState: location.trim(),
            country: country.trim(),
            postalCode: postalCode.trim(),
          },
        }),
      });
      const profileData = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (
        !response.ok ||
        profileData?.success === false ||
        profileData?.status === false
      )
        throw new Error(profileData?.message || "Unable to update profile.");
      if (!profileImageFile) return profileData;
      const formData = new FormData();
      formData.append("profileImage", profileImageFile, profileImageFile.name);
      const avatarResponse = await fetch(
        `${getApiBaseUrl()}/user/upload-avatar`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        },
      );
      const avatarData = (await avatarResponse
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (
        !avatarResponse.ok ||
        avatarData?.success === false ||
        avatarData?.status === false
      )
        throw new Error(
          avatarData?.message || "Unable to update profile image.",
        );
      return avatarData || profileData;
    },
    onSuccess: async (data) => {
      toast.success(data?.message || "Profile updated successfully.");
      setProfileImageFile(undefined);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to update profile.",
      ),
  });

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim()) return toast.error("First name is required.");
    if (!accessToken) return toast.error("You are not authorized.");
    updateProfileMutation.mutate();
  };
  const user = profileQuery.data;
  const fullName = `${firstName} ${lastName}`.trim() || user?.name || "User";
  const disabled = profileQuery.isLoading || updateProfileMutation.isPending;
  const inputClass = "h-9 w-full rounded-md border border-[#E7D8B8]/80 bg-[#4B351F] px-3 text-xs text-[#F7E4B3] outline-none placeholder:text-[#A98D68] focus:border-[#D6AA50] disabled:cursor-not-allowed disabled:opacity-75";

  return (
    <div className="space-y-4">
      <ProfileSummaryCard
        name={fullName}
        email={email || user?.email}
        phone={phone}
        location={location}
        since={user?.createdAt}
        image={profileImagePreview}
        disabled={disabled}
        onImageChange={handleImage}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
      <section className="rounded-lg bg-[#523B21] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-[#F7E4B3]">Personal Information</h2><button type="button" onClick={() => setEditingPersonal((value) => !value)} aria-label="Edit personal information" className="cursor-pointer text-[#F2D78F] hover:text-[#D6AA50]"><Pencil className="h-4 w-4" /></button></div>
        {profileQuery.error && (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "Unable to load profile."}
          </p>
        )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First Name">
              <input
                required
                value={firstName}
                disabled={disabled || !editingPersonal}
                onChange={(event) => setFirstName(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Last Name">
              <input
                value={lastName}
                disabled={disabled || !editingPersonal}
                onChange={(event) => setLastName(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Date of Birth"><input type="date" value={dateOfBirth} disabled={disabled || !editingPersonal} onChange={(event) => setDateOfBirth(event.target.value)} className={inputClass} /></Field>
            <fieldset disabled={disabled || !editingPersonal} className="space-y-2 text-[11px]"><legend>Gender</legend><div className="flex h-9 items-center gap-5">{["male", "female"].map((option) => <label key={option} className="flex cursor-pointer items-center gap-2 capitalize text-[#BFA98A]"><input type="radio" name="gender" checked={gender === option} onChange={() => setGender(option)} className="accent-[#D6AA50]" />{option}</label>)}</div></fieldset>
          </div>
      </section>

      <section className="rounded-lg bg-[#523B21] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-[#F7E4B3]">Contact Information</h2><button type="button" onClick={() => setEditingContact((value) => !value)} aria-label="Edit contact information" className="cursor-pointer text-[#F2D78F] hover:text-[#D6AA50]"><Pencil className="h-4 w-4" /></button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email"><input type="email" value={email} disabled className={inputClass} /></Field>
          <Field label="Phone Number"><input type="tel" value={phone} disabled={disabled || !editingContact} onChange={(event) => setPhone(event.target.value)} placeholder="Enter your phone number" className={inputClass} /></Field>
          <Field label="Country"><select value={country} disabled={disabled || !editingContact} onChange={(event) => setCountry(event.target.value)} className={inputClass}><option value="">Choose any one</option><option>United States</option><option>Cuba</option><option>Bangladesh</option></select></Field>
          <Field label="State/Region"><input value={location} disabled={disabled || !editingContact} onChange={(event) => setLocation(event.target.value)} placeholder="Enter state or region" className={inputClass} /></Field>
          <Field label="Nationality"><select value={nationality} disabled={disabled || !editingContact} onChange={(event) => setNationality(event.target.value)} className={inputClass}><option value="">Choose any one</option><option>American</option><option>Cuban</option><option>Bangladeshi</option></select></Field>
          <Field label="Postcode"><input value={postalCode} disabled={disabled || !editingContact} onChange={(event) => setPostalCode(event.target.value)} placeholder="e.g. 5585" className={inputClass} /></Field>
          <div className="sm:col-span-2"><Field label="Address"><textarea value={streetAddress} disabled={disabled || !editingContact} onChange={(event) => setStreetAddress(event.target.value)} placeholder="Enter your full address" className={`${inputClass} h-20 resize-none py-3`} /></Field></div>
        </div>
        {(editingPersonal || editingContact) ? <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => user && populateForm(user)}
              disabled={disabled}
              className="h-9 cursor-pointer rounded-md border border-[#D6AA50] px-4 text-xs text-[#F7E4B3] hover:bg-[#D6AA50]/10"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="h-9 cursor-pointer rounded-md bg-[#D6AA50] px-5 text-xs font-semibold text-[#3A2818] hover:bg-[#E7BF69] disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div> : null}
      </section>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-[11px] font-medium text-[#F7E4B3]">
      <span>{label}</span>
      {children}
    </label>
  );
}
