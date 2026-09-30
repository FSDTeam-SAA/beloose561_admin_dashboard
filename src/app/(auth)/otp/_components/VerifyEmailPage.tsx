"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(59); // সেকেন্ডস
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() || "";

  const verifyMutation = useMutation({
    mutationFn: async (body: { email: string; otp: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "OTP verification failed");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Email verified successfully");
      router.push(`/change-password?email=${encodeURIComponent(email)}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.message || "Failed to resend OTP");
      return data;
    },
    onSuccess: (data) => {
      setTimeLeft(59);
      toast.success(data?.message || "OTP resent successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // টাইমার লজিক
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ইনপুট হ্যান্ডলিং ও অটো-ফোকাস শিফট
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const value = element.value;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // শুধু শেষ ক্যারেক্টারটি নিবে
    setOtp(newOtp);

    // পরবর্তী ইনপুটে ফোকাস করা
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // ব্যাকস্পেস প্রেস করলে আগের ঘরে ফেরত যাওয়া
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (!email) return toast.error("Email address is missing. Please restart password recovery.");
    if (otpString.length !== 6) return toast.error("Please enter the 6-digit OTP");
    verifyMutation.mutate({ email, otp: otpString });
  };

  // টাইমার ফরম্যাটিং (00:XX)
  const formatTime = (seconds: number) => {
    return `00:${seconds < 10 ? `0${seconds}` : seconds}`;
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
          Verify Email
        </h1>
        <p className="text-[10px] font-light text-stone-400 tracking-wider text-center mb-6">
          Enter OTP to verify your email address
        </p>

        {/* ফর্ম */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* OTP বক্সসমূহ */}
          <div className="grid grid-cols-6 gap-2 md:gap-3.5 justify-center">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                name="otp"
                maxLength={1}
                value={data}
                ref={(el) => { inputRefs.current[index] = el; }}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-full aspect-square text-center text-xl font-bold bg-[#23170e]/70 border border-stone-700/60 focus:border-[#cca352] text-[#cca352] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#cca352] transition-all"
              />
            ))}
          </div>

          {/* টাইমার ও রিসেন্ড লিংক */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 px-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-stone-500" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div>
              Didn&apos;t get a code?{" "}
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={!email || resendMutation.isPending || timeLeft > 0}
                className="text-[#cca352] hover:underline font-semibold bg-transparent border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resend
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full cursor-pointer h-[45px] bg-[#cca352] hover:bg-[#b88f3e] text-[#140d09] font-bold text-xs rounded-[8px] transition-colors shadow-lg shadow-black/40 mt-1 tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </main>
  );
}
