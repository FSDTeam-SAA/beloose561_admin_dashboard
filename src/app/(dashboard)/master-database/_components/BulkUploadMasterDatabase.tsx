"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, FileSpreadsheet, Info, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File) => void;
}

const supportedExtensions = [".csv", ".xlsx", ".xls"];

const templateHeaders = [
  "Product Line",
  "Brand",
  "UPC Codes",
  "Name",
  "Manufacturer",
  "Country",
  "Origin Region",
  "Vitola",
  "Strength",
  "Wrapper",
  "Binder",
  "Filler",
  "Size",
  "Length",
  "Ring Gauge",
  "Flavor Notes",
  "Description",
  "Why You'll Like This",
  "Image",
  "Estimated Smoking Time",
  "Pairing Suggestions",
  "Suggested Retail Price (Each)",
  "Suggested Retail Price (Box)",
  "Status",
];

const sampleRow = [
  "Gran Reserva",
  "Arturo Fuente",
  "0716103012345|0716103012352",
  "Gran Reserva Robusto",
  "Tabacalera A. Fuente",
  "Dominican Republic",
  "Santiago",
  "Robusto",
  "Medium",
  "Ecuadorian Habano",
  "Dominican",
  "Dominican|Nicaraguan",
  "5 x 50",
  "5.0",
  "50",
  "cedar|cocoa|leather",
  "Premium handmade cigar with rich Dominican fillers.",
  "Smooth and balanced flavor profile perfect for any occasion.",
  "https://example.com/cigar.jpg",
  "60",
  "Cigar + Coffee / Espresso|Cigar + Whiskey",
  "18.50",
  "185.00",
  "active",
];

export default function BulkUploadMasterDatabase({
  open,
  pending,
  onOpenChange,
  onSubmit,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setFile(null);
      setError("");
    }
  }, [open]);

  const chooseFile = (selected?: File) => {
    if (!selected) return;
    const fileName = selected.name.toLowerCase();
    if (!supportedExtensions.some((extension) => fileName.endsWith(extension))) {
      setFile(null);
      setError("Please select a CSV, XLSX, or XLS file.");
      return;
    }
    setFile(selected);
    setError("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a CSV, XLSX, or XLS file.");
      return;
    }
    onSubmit(file);
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        templateHeaders.map((h) => `"${h}"`).join(","),
        sampleRow.map((v) => `"${v}"`).join(","),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Humidor411-MasterDatabase-Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !pending && onOpenChange(value)}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="w-[calc(100%-1.5rem)] max-w-[560px] gap-0 overflow-hidden rounded-lg border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl font-semibold text-[#F1C75B]">
            Bulk Upload Master Cigars
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-[#CDB37A]">
            Upload a CSV or Excel file to batch-import master cigars into the central database.
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close"
          disabled={pending}
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#E6C66D] hover:bg-[#D6AA50]/15"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#D6AA50]/25 bg-[#342315]/45 p-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#F8E8C4]">
                Download Standard Template
              </p>
              <p className="mt-0.5 truncate text-[10px] text-[#CDB37A]">
                Includes all 24 master fields (UPC, vitola, filler, pricing, etc.)
              </p>
            </div>
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded border border-[#D6AA50] px-3 text-[11px] font-semibold text-[#F4D77B] hover:bg-[#D6AA50]/10"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#D6AA50]/60 bg-[#342315]/45 px-5 text-center transition hover:bg-[#D6AA50]/10"
          >
            {file ? (
              <>
                <FileSpreadsheet className="mb-3 h-9 w-9 text-[#D6AA50]" />
                <span className="max-w-full truncate text-sm font-medium text-[#F8E8C4]">
                  {file.name}
                </span>
                <span className="mt-1 text-[11px] text-[#CDB37A]">
                  {(file.size / 1024).toFixed(1)} KB · Click to replace
                </span>
              </>
            ) : (
              <>
                <Upload className="mb-3 h-9 w-9 text-[#D6AA50]" />
                <span className="text-sm font-medium text-[#F8E8C4]">
                  Choose CSV or Excel file
                </span>
                <span className="mt-1 text-[11px] text-[#CDB37A]">
                  Required columns: Product Line, Brand
                </span>
              </>
            )}
          </button>

          <div className="rounded-md border border-[#D6AA50]/20 bg-[#2B1B11] p-3 text-[11px] leading-relaxed text-[#CDB37A]">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-[#F1C75B]">
              <Info className="h-3.5 w-3.5" />
              Supported Columns & Formatting:
            </div>
            <p>
              • <strong>Required:</strong> Product Line, Brand
            </p>
            <p>
              • <strong>Multiple values:</strong> Separate with <code>|</code> or comma (e.g. UPC Codes: <code>0716103012345|0716103012352</code>, Flavor Notes: <code>cedar|cocoa</code>).
            </p>
            <p>
              • <strong>Other Fields:</strong> Name, Manufacturer, Country, Vitola, Strength, Wrapper, Binder, Filler, Size, Length, Ring Gauge, Pricing, Status.
            </p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              disabled={pending}
              onClick={() => onOpenChange(false)}
              className="h-10 cursor-pointer rounded border border-[#D6AA50] text-xs text-[#F4D77B] hover:bg-[#D6AA50]/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-10 cursor-pointer rounded bg-[#D6AA50] text-xs font-semibold text-[#3A2417] hover:bg-[#E7BF69] disabled:opacity-50"
            >
              {pending ? "Uploading & Importing..." : "Upload & Import"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
