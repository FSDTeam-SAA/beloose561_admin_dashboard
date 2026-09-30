"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { ContentItem } from "./ContentList";
import { ContentFormModal, type ContentFormData } from "./AddContent";

interface EditContentProps {
  open: boolean;
  content: ContentItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (content: ContentItem) => void;
}

export default function EditContent({
  open,
  content,
  onOpenChange,
  onSave,
}: EditContentProps) {
  const [image, setImage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (content) setImage(content.image);
  }, [content]);
  if (!content) return null;
  const initial: ContentFormData = content;
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      ...content,
      welcomeText: String(data.get("welcomeText")),
      sectionName: String(data.get("sectionName")),
      title: String(data.get("title")),
      subtitle: String(data.get("subtitle")),
      status: data.get("status") === "Hidden" ? "Hidden" : "Published",
      image,
      lastUpdated: "Jul 8, 2025",
    });
    onOpenChange(false);
  };
  return (
    <ContentFormModal
      key={content.id}
      open={open}
      title="Edit Section"
      submitLabel="Update"
      image={image}
      initial={initial}
      fileRef={fileRef}
      onFile={handleFile}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
}
