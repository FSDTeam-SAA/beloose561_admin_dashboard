"use client";

import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Pagination from "@/components/pagenation/Pagenation";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import AddContent, { defaultImage, type ContentFormData } from "./AddContent";
import EditContent from "./EditContent";
import ViewContent from "./ViewContent";

export interface ContentItem {
  id: number;
  site: "Customer Website" | "Retailer Website";
  welcomeText: string;
  sectionName: string;
  title: string;
  subtitle: string;
  image: string;
  lastUpdated: string;
  status: "Published" | "Hidden";
}

const sectionNames = [
  "Hero Section",
  "Featured Cigars",
  "Cigar Journey",
  "Similar Recommendations",
  "Discover",
  "New Arrivals",
  "Promotions",
  "Pairing Suggestions",
  "Retailer Hero",
  "Store Locator",
  "Membership",
  "Contact Section",
];
const initialContents: ContentItem[] = sectionNames.map(
  (sectionName, index) => ({
    id: index + 1,
    site: index < 8 ? "Customer Website" : "Retailer Website",
    welcomeText: "WELCOME TO THE Casa del Habano NYC",
    sectionName,
    title:
      index === 0
        ? "Find the Perfect Cigar for Every Occasion Here."
        : `${sectionName} at Casa del Habano`,
    subtitle:
      "Whether you're searching for a familiar favorite or something new, Humidor411 helps you discover premium cigars and guides you directly to their location.",
    image: defaultImage,
    lastUpdated: index < 7 ? `Jul ${7 - index}, 2025` : "Jun 30, 2025",
    status: index === 3 || index === 9 ? "Hidden" : "Published",
  }),
);

export default function ContentList() {
  const [contents, setContents] = useState(initialContents);
  const [site, setSite] = useState<ContentItem["site"]>("Customer Website");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [viewing, setViewing] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState<ContentItem | null>(null);
  const limit = 5;
  const filtered = contents.filter((content) => content.site === site);
  const visible = filtered.slice((page - 1) * limit, page * limit);

  const addContent = (data: ContentFormData) => {
    setContents((current) => [
      {
        ...data,
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
        site,
        lastUpdated: "Jul 8, 2025",
      },
      ...current,
    ]);
    setPage(1);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full max-w-[420px] grid-cols-2 rounded-md bg-[#4A3520] p-1">
          {(["Customer Website", "Retailer Website"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setSite(tab);
                setPage(1);
              }}
              className={`h-10 cursor-pointer rounded text-xs transition ${site === tab ? "bg-[#D6AA50] font-semibold text-[#2B1B10]" : "text-[#D6AA50] hover:bg-[#D6AA50]/10"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded bg-[#D6AA50] px-5 text-xs font-semibold text-[#2B1B10] hover:bg-[#E7BF69]"
        >
          <Plus className="h-4 w-4" />
          Add New Section
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-[#CBA24A]/55">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="bg-[#1B1009]">
            <tr>
              {[
                "Image",
                "Section Name",
                "Title",
                "Description",
                "Last Updated",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-[10px] font-semibold text-[#F7E4B3]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CBA24A]/45 bg-[#342315]/55">
            {visible.map((content) => (
              <tr key={content.id} className="h-[60px] hover:bg-[#4A301D]/60">
                <td className="px-4 py-2">
                  <Image
                    src={content.image}
                    alt=""
                    width={64}
                    height={40}
                    unoptimized
                    className="h-10 w-16 rounded object-cover"
                  />
                </td>
                <td className="px-4 py-3 text-xs font-medium text-[#F7E4B3]">
                  {content.sectionName}
                </td>
                <td
                  className="max-w-[190px] truncate px-4 py-3 text-xs text-[#BFA98A]"
                  title={content.title}
                >
                  {content.title}
                </td>
                <td
                  className="max-w-[240px] truncate px-4 py-3 text-xs text-[#BFA98A]"
                  title={content.subtitle}
                >
                  {content.subtitle}
                </td>
                <td className="px-4 py-3 text-xs text-[#BFA98A]">
                  {content.lastUpdated}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-[9px] ${content.status === "Published" ? "bg-[#0D543F] text-[#20E5A3]" : "bg-[#6B211D] text-[#FF5B55]"}`}
                  >
                    {content.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-[#D6AA50]">
                    <ActionButton
                      label={`Edit ${content.sectionName}`}
                      onClick={() => setEditing(content)}
                    >
                      <Pencil className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton
                      label={`View ${content.sectionName}`}
                      onClick={() => setViewing(content)}
                    >
                      <Eye className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton
                      label={`Delete ${content.sectionName}`}
                      onClick={() => setDeleting(content)}
                      danger
                    >
                      <Trash2 className="h-4 w-4" />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="h-28 text-center text-xs text-[#9A8060]"
                >
                  No sections found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        limit={limit}
        total={filtered.length}
        currentCount={visible.length}
        onPageChange={setPage}
      />

      <AddContent open={addOpen} onOpenChange={setAddOpen} onAdd={addContent} />
      <EditContent
        open={editing !== null}
        content={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSave={(updated) =>
          setContents((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          )
        }
      />
      <ViewContent
        open={viewing !== null}
        content={viewing}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
      />
      <DeleteModal
        open={deleting !== null}
        title="Delete Section"
        itemName={deleting?.sectionName}
        description={
          deleting
            ? `Are you sure you want to delete ${deleting.sectionName}?`
            : undefined
        }
        onConfirm={() => {
          if (deleting)
            setContents((current) =>
              current.filter((item) => item.id !== deleting.id),
            );
          setDeleting(null);
        }}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`cursor-pointer p-1 transition-colors ${danger ? "hover:text-red-500" : "hover:text-[#F7D77F]"}`}
    >
      {children}
    </button>
  );
}
