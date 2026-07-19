"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function PasswordSuccessPage() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{
        backgroundImage: `url('/images/bg_auth_image.png')`,
      }}
    >
      <div className="relative w-full max-w-[550px] rounded-xl border border-[#CBA24A]/80 bg-[#140d09]/20 backdrop-blur-md px-6 py-6 md:px-8 md:py-8 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        
        {/* লোগো */}
        <div className="relative mb-2 h-[88px] w-[88px] drop-shadow-[0_0_12px_rgba(204,163,82,0.55)] md:h-24 md:w-24">
          <Image
            src="/images/humidor-logo2.png"
            alt="Humidor logo"
            fill
            sizes="(max-width: 768px) 88px, 96px"
            priority
            className="object-contain object-center"
          />
        </div>

        {/* সাকসেস মেসেজ */}
        <h1 className="text-[34px] font-serif font-medium text-[#cca352] tracking-wide text-center mb-1 line-clamp-2">
          Password Changed Successfully
        </h1>
        <p className="text-[10px] font-light text-stone-400 tracking-wider text-center mb-6">
          Your password has been updated successfully
        </p>

        {/* ব্যাক টু লগইন বাটন */}
        <Link
          href="/signin" // আপনার রাউট অনুযায়ী লিংক পরিবর্তন করতে পারেন
          className="w-full flex items-center justify-center h-[45px] bg-[#cca352] hover:bg-[#b88f3e] text-[#140d09] font-bold text-xs rounded-[8px] transition-colors shadow-lg shadow-black/40 tracking-wide"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}