"use client";

import React, { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

 const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res?.error);
      }

      toast.success("Login Successfully !");
      router.replace("/");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{
        backgroundImage: `url('/images/bg_auth_image.png')`,
      }}
    >
      {/* সেন্টারড সাইন-ইন কার্ড */}
      <div className="relative w-full max-w-[550px] rounded-xl border border-[#CBA24A]/80 bg-[#140d09]/20 backdrop-blur-md px-6 py-5 md:px-8 md:py-6 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        <div className="relative mb-1 h-[88px] w-[88px] drop-shadow-[0_0_12px_rgba(204,163,82,0.55)] md:h-24 md:w-24">
          <Image
            src="/images/humidor-logo2.png"
            alt="Humidor logo"
            fill
            sizes="(min-width: 768px) 96px, 88px"
            priority
            className="object-contain object-center"
          />
        </div>

        {/* হেডার টেক্সট গ্রুপ */}
        <h1 className="text-[40px] font-serif font-medium text-[#cca352] tracking-wide text-center mb-0.5">
          Welcome Back
        </h1>
        <p className="text-[10px] font-light text-stone-400 tracking-wider text-center mb-5">
          Sign in to your humidor account
        </p>

        {/* সাইন ইন ফর্ম */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          {/* ইমেইল ইনপুট */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#F7E4B3]">
              Email Address
            </label>
            <Input
              type="email"
              required
              placeholder="Enter Your Email Address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[45px] bg-[#23170e]/70 border-stone-800/80 focus:border-amber-700/50 text-stone-200 placeholder:text-stone-600 text-xs rounded-[8px] px-3 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            />
          </div>

          {/* পাসওয়ার্ড ইনপুট */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#F7E4B3]">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[45px] w-full bg-[#23170e]/70 border-stone-800/80 focus:border-amber-700/50 text-stone-200 placeholder:text-stone-600 text-xs rounded-[8px] px-3 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-[#cca352] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#cca352]"
              >
                {showPassword ? (
                  <EyeOff className="!h-5 !w-5 stroke-[1.7]" />
                ) : (
                  <Eye className="!h-5 !w-5 stroke-[1.7]" />
                )}
              </button>
            </div>
          </div>

          {/* রিমেম্বার মি এবং ফরগট পাসওয়ার্ড অপশন */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberPage"
                className="h-[18px] cursor-pointer w-[18px] shrink-0 rounded-[4px] border-stone-600 bg-[#23170e]/60 data-[state=checked]:border-[#cca352] data-[state=checked]:bg-[#cca352] data-[state=checked]:text-black"
              />
              <label
                htmlFor="rememberPage"
                className="text-stone-400 font-medium cursor-pointer select-none"
              >
                Remember Me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-[#cca352] hover:underline font-medium text-[9px]"
            >
              Forget Password?
            </Link>
          </div>

          {/* সাইন ইন বাটন */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer h-[45px] bg-[#cca352] hover:bg-[#b88f3e] text-[#140d09] font-bold text-xs rounded-[8px] transition-colors shadow-lg shadow-black/40 mt-1.5 tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          {/* নিচে রেজিস্ট্রেশন লিঙ্ক */}
          {/* <div className="text-center text-[10px] text-stone-400 mt-1">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#cca352] hover:underline font-semibold"
            >
              Register Here
            </Link>
          </div> */}
        </form>
      </div>
    </main>
  );
}
