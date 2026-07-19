"use client";

import type { ChangeEvent } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";

interface ProfileSummaryCardProps {
  name?: string; email?: string; phone?: string; location?: string; since?: string | null;
  image?: string; disabled?: boolean; onImageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

function initials(name: string) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

export default function ProfileSummaryCard({ name = "The Cigar Lounge", image, disabled, onImageChange }: ProfileSummaryCardProps) {
  return (
    <section className="relative h-[140px] overflow-hidden rounded-lg bg-[#21160E]">
      <Image src="/images/bg_auth_image.png" alt="" fill priority className="object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3A2818] via-black/15 to-black/35" />
      <div className="absolute bottom-3 left-3 flex items-center gap-3 sm:bottom-4 sm:left-5">
        <div className="relative h-[68px] w-[68px] overflow-hidden rounded-md border border-[#D6AA50] bg-[#24180F]">
          {image ? <Image src={image} alt={name} fill unoptimized className="object-cover" /> : <span className="flex h-full w-full items-center justify-center text-xl font-bold text-[#D6AA50]">{initials(name)}</span>}
          {onImageChange ? <label className="absolute bottom-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#D6AA50] text-[#3A2818]"><Pencil className="h-3 w-3" /><span className="sr-only">Change profile picture</span><input type="file" accept="image/png,image/jpeg" disabled={disabled} onChange={onImageChange} className="hidden" /></label> : null}
        </div>
        <div className="pb-3"><h2 className="font-serif text-xl font-semibold text-[#F7E4B3]">{name}</h2><p className="text-[10px] text-[#BFA98A]">Premium Retailer · Humidor411 Partner</p></div>
      </div>
    </section>
  );
}
