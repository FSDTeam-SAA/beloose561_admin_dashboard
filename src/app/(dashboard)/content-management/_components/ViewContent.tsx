"use client";

import { X } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContentItem } from "./ContentList";

export default function ViewContent({
  open,
  content,
  onOpenChange,
}: {
  open: boolean;
  content: ContentItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!content) return null;
  const details = [
    ["Welcome Text", content.welcomeText],
    ["Section Name", content.sectionName],
    ["Title", content.title],
    ["Subtitle", content.subtitle],
    ["Last Updated", content.lastUpdated],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-[5px]"
        className="max-h-[92vh] w-[calc(100%-2rem)] max-w-[560px] gap-0 overflow-y-auto rounded-xl border border-[#CBA24A]/10 bg-[#4A2D1D] p-0 text-[#F7E4B3]"
      >
        <DialogHeader className="px-5 pb-4 pt-5">
          <DialogTitle className="pr-8 font-serif text-2xl text-[#D6AA50]">
            Section Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Details for {content.sectionName}
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close section details"
            className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-xl rounded-tr-xl bg-[#D6AA50] text-[#4A2D1D] hover:bg-[#E7BF69]"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <div className="space-y-4 px-5 pb-5">
          <Image
            src={content.image}
            alt={content.sectionName}
            width={80}
            height={80}
            unoptimized
            className="h-20 w-20 rounded object-cover"
          />
          <dl className="space-y-3">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="mb-1 text-[11px] font-semibold">{label}</dt>
                <dd className="text-[11px] leading-4 text-[#BFA98A]">
                  {value}
                </dd>
              </div>
            ))}
            <div>
              <dt className="mb-1 text-[11px] font-semibold">Status</dt>
              <dd>
                <span
                  className={`rounded-full px-3 py-1 text-[9px] ${content.status === "Published" ? "bg-[#0D543F] text-[#20E5A3]" : "bg-[#6B211D] text-[#FF5B55]"}`}
                >
                  {content.status}
                </span>
              </dd>
            </div>
          </dl>
          <div>
            <p className="mb-2 text-[11px] font-semibold">Preview</p>
            <div className="relative h-48 overflow-hidden rounded">
              <Image
                src={content.image}
                alt="Section preview"
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 px-6 text-center">
                <span className="text-[8px]">{content.welcomeText}</span>
                <h3 className="mt-2 font-serif text-xl text-[#F0C96E]">
                  {content.title}
                </h3>
                <p className="mt-2 max-w-sm text-[8px]">{content.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
