"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Upload, X } from "lucide-react";
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

export type ContentFormData = Omit<ContentItem, "id" | "lastUpdated" | "site">;

interface AddContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (content: ContentFormData) => void;
}

export const fieldClass =
  "h-10 w-full rounded-md border border-transparent bg-[#62432F] px-3 text-xs text-[#F8E8C4] outline-none placeholder:text-[#BFA98A]/60 focus:border-[#D6AA50]/70";
export const defaultImage = "/images/bg_auth_image.png";

export default function AddContent({
  open,
  onOpenChange,
  onAdd,
}: AddContentProps) {
  const [image, setImage] = useState(defaultImage);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setImage(defaultImage);
  }, [open]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onAdd({
      welcomeText: String(data.get("welcomeText")),
      sectionName: String(data.get("sectionName")),
      title: String(data.get("title")),
      subtitle: String(data.get("subtitle")),
      image,
      status: data.get("status") === "Hidden" ? "Hidden" : "Published",
    });
    event.currentTarget.reset();
    onOpenChange(false);
  };

  return (
    <ContentFormModal
      open={open}
      title="Add New Section"
      submitLabel="Upload"
      image={image}
      fileRef={fileRef}
      onFile={handleFile}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
}

interface ContentFormModalProps {
  open: boolean;
  title: string;
  submitLabel: string;
  image: string;
  initial?: ContentFormData;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ContentFormModal({
  open,
  title,
  submitLabel,
  image,
  initial,
  fileRef,
  onFile,
  onOpenChange,
  onSubmit,
}: ContentFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 backdrop-blur-[5px]"
        className="max-h-[92vh] w-[calc(100%-2rem)] max-w-[520px] gap-0 overflow-y-auto rounded-xl border border-[#CBA24A]/10 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.65)]"
      >
        <DialogHeader className="px-5 pb-4 pt-5">
          <DialogTitle className="pr-8 font-serif text-2xl text-[#D6AA50]">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {title} form
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close"
            className="absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-bl-xl rounded-tr-xl bg-[#D6AA50] text-[#4A2D1D] hover:bg-[#E7BF69]"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <form onSubmit={onSubmit} className="space-y-3.5 px-5 pb-5">
          <FormField
            name="welcomeText"
            label="Welcome Text"
            defaultValue={
              initial?.welcomeText ?? "WELCOME TO THE Casa del Habano NYC"
            }
          />
          <FormField
            name="sectionName"
            label="Section Name"
            defaultValue={initial?.sectionName ?? "Hero Section"}
          />
          <FormField
            name="title"
            label="Title"
            defaultValue={
              initial?.title ??
              "Find the Perfect Cigar for Every Occasion Here."
            }
          />
          <label className="block space-y-1.5 text-[11px]">
            <span>Subtitle</span>
            <textarea
              name="subtitle"
              required
              defaultValue={
                initial?.subtitle ??
                "Whether you're searching for a familiar favorite or something new, Humidor411 helps you discover premium cigars and guides you directly to their location."
              }
              className={`${fieldClass} h-20 resize-none py-3`}
            />
          </label>
          <div className="space-y-1.5">
            <span className="block text-[11px]">Background Image</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={onFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-[#D9C6A5]/80 text-[#D9C6A5] hover:border-[#D6AA50]"
            >
              {image !== defaultImage || initial ? (
                <>
                  <Image
                    src={image}
                    alt="Selected preview"
                    fill
                    unoptimized
                    className="object-cover opacity-35"
                  />
                  <Upload className="relative h-5 w-5 text-[#D6AA50]" />
                  <span className="relative text-[10px]">Click to replace</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-[#D6AA50]" />
                  <span className="text-[10px]">Click to upload</span>
                </>
              )}
            </button>
          </div>
          <fieldset className="space-y-1.5">
            <legend className="text-[11px]">Status</legend>
            <div className="flex gap-2">
              {["Published", "Hidden"].map((status) => (
                <label key={status} className="cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    defaultChecked={(initial?.status ?? "Published") === status}
                    className="peer sr-only"
                  />
                  <span className="inline-flex rounded-full border border-transparent px-3 py-1 text-[9px] text-[#8F7659] peer-checked:border-[#18805D] peer-checked:bg-[#15533F] peer-checked:text-[#25E4A4]">
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 cursor-pointer rounded border border-[#D6AA50] text-[11px] hover:bg-[#D6AA50]/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 cursor-pointer rounded bg-[#D6AA50] text-[11px] font-semibold text-[#3A2417] hover:bg-[#E7BF69]"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1.5 text-[11px]">
      <span>{label}</span>
      <input {...props} required className={fieldClass} />
    </label>
  );
}
