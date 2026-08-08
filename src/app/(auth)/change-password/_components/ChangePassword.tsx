"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ChangePasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() || "";

  const restPasswordMutation = useMutation({
    mutationFn: async (bodyData: {
      email: string;
      newPassword: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/change-password`,
        {
          method: "POST",



          
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.message || "Password reset failed");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successful");
      setSuccessModalOpen(true);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reset password");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return toast.error("Email address is missing. Please restart password recovery.");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    restPasswordMutation.mutate({ email, newPassword });
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{
        backgroundImage: `url('/images/bg_auth_image.png')`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ,
      }}
    >
      <div className="relative w-full max-w-[550px] rounded-xl border border-[#CBA24A]/80 bg-[#140d09]/20 backdrop-blur-md px-6 py-5 md:px-8 md:py-6 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        
        {/* লোগো */}
        <div className="relative mb-1 h-[88px] w-[88px] drop-shadow-[0_0_12px_rgba(204,163,82,0.55)] md:h-24 md:w-24">
          <Image
            src="/images/humidor-logo2.png"
            alt="Humidor logo"
            fill
            sizes="(max-width: 768px) 88px, 96px"
            priority
            className="object-contain object-center"
          />
        </div>

        {/* হেডার টেক্সট */}
        <h1 className="text-[40px] font-serif font-medium text-[#cca352] tracking-wide text-center mb-0.5">
          Change Password
        </h1>
        <p className="text-[10px] font-light text-stone-400 tracking-wider text-center mb-5">
          Enter your email to recover your password
        </p>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          
          {/* নতুন পাসওয়ার্ড ইনপুট */}
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="newPassword" className="text-[12px] font-semibold uppercase tracking-wider text-[#F7E4B3] cursor-pointer">
              Create New Password
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="Create a strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-[45px] w-full bg-[#23170e]/70 border-stone-800/80 focus:border-amber-700/50 text-stone-200 placeholder:text-stone-600 text-xs rounded-[8px] px-3 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-[#cca352] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#cca352]"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 stroke-[1.7]" />
                ) : (
                  <Eye className="h-5 w-5 stroke-[1.7]" />
                )}
              </button>
            </div>
          </div>

          {/* পাসওয়ার্ড নিশ্চিতকরণ ইনপুট */}
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="confirmPassword" className="text-[12px] font-semibold uppercase tracking-wider text-[#F7E4B3] cursor-pointer">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-[45px] w-full bg-[#23170e]/70 border-stone-800/80 focus:border-amber-700/50 text-stone-200 placeholder:text-stone-600 text-xs rounded-[8px] px-3 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-[#cca352] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#cca352]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 stroke-[1.7]" />
                ) : (
                  <Eye className="h-5 w-5 stroke-[1.7]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={restPasswordMutation.isPending}
            className="w-full cursor-pointer h-[45px] bg-[#cca352] hover:bg-[#b88f3e] text-[#140d09] font-bold text-xs rounded-[8px] transition-colors shadow-lg shadow-black/40 mt-1.5 tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
          >
            {restPasswordMutation.isPending ? "Changing Password..." : "Continue"}
          </button>
        </form>
      </div>

      <Dialog open={successModalOpen} onOpenChange={() => undefined}>
        <DialogContent
          showCloseButton={false}
          className="border-[#CBA24A]/80 bg-[#1b120c] text-stone-200 sm:max-w-md"
          overlayClassName="bg-black/75 backdrop-blur-sm"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader className="items-center text-center">
            <DialogTitle className="font-serif text-2xl text-[#cca352]">
              Password Changed Successfully
            </DialogTitle>
            <DialogDescription className="text-center text-stone-400">
              Your password has already been changed. Please sign in again with your new password.
            </DialogDescription>
          </DialogHeader>
          <button
            type="button"
            onClick={() => router.replace("/signin")}
            className="mt-2 h-[45px] w-full rounded-[8px] bg-[#cca352] text-xs font-bold tracking-wide text-[#140d09] transition-colors hover:bg-[#b88f3e]"
          >
            Back to Login
          </button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
