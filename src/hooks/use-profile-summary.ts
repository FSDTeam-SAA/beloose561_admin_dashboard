"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface ProfileResponse {
  success?: boolean;
  message?: string;
  data?: {
    fullName?: string;
    email?: string;
    profilePicture?: string;
  };
}

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!url) throw new Error("Backend API URL is not configured.");
  return url.replace(/\/$/, "");
}

export function useProfileSummary() {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | {
        name?: string;
        email?: string;
        profileImage?: string;
        accessToken?: string;
      }
    | undefined;

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    enabled: Boolean(sessionUser?.accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/profile`, {
        headers: { Authorization: `Bearer ${sessionUser?.accessToken}` },
      });
      const result = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to load profile.");
      }
      return result.data;
    },
  });

  return {
    name: profileQuery.data?.fullName || sessionUser?.name || "Admin User",
    email:
      profileQuery.data?.email || sessionUser?.email || "admin@example.com",
    image:
      profileQuery.data?.profilePicture || sessionUser?.profileImage || "",
  };
}
