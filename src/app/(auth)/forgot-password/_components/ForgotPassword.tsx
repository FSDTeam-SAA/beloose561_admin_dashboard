"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

 const forgotPassMutation = useMutation({
    mutationFn: async (bodyData: { email: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
      body: JSON.stringify(bodyData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send email");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      router.push(`/otp?email=${encodeURIComponent(email.trim())}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    forgotPassMutation.mutate({ email: email.trim() });
  };


  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{
        backgroundImage: `url('/images/bg_auth_image.png')`,
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
          Forgot Password!
        </h1>
        <p className="text-[10px] font-light text-stone-400 tracking-wider text-center mb-5">
          Enter your email to recover your password
        </p>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-[12px] font-semibold uppercase tracking-wider text-[#F7E4B3] cursor-pointer">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              required
              placeholder="Enter Your Email Address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[45px] bg-[#23170e]/70 border-stone-800/80 focus:border-amber-700/50 text-stone-200 placeholder:text-stone-600 text-xs rounded-[8px] px-3 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={forgotPassMutation.isPending}
            className="w-full cursor-pointer h-[45px] bg-[#cca352] hover:bg-[#b88f3e] text-[#140d09] font-bold text-xs rounded-[8px] transition-colors shadow-lg shadow-black/40 mt-1 tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
          >
            {forgotPassMutation.isPending ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </main>
  );
}
