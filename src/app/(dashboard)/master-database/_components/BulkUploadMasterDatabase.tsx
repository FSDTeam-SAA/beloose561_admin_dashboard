"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
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

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !pending && onOpenChange(value)}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[2px]"
        className="w-[calc(100%-1.5rem)] max-w-[520px] gap-0 overflow-hidden rounded-lg border border-[#A67C3D]/70 bg-[#4A2D1D] p-0 text-[#F7E4B3] shadow-[0_24px_90px_rgba(0,0,0,.75)]"
      >
        <DialogHeader className="border-b border-[#A67C3D]/35 px-5 pb-4 pt-5">
          <DialogTitle className="font-serif text-xl font-semibold text-[#F1C75B]">
            Add Bulk Data
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-[#CDB37A]">
            Upload a CSV or Excel file to add multiple products at once.
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
                Download Excel Template
              </p>
              <p className="mt-1 truncate text-[10px] text-[#CDB37A]">
                Humidor411-MasterDatabase.xlsx
              </p>
            </div>
            <a
              href="/images/Humidor411-MasterDatabase.xlsx"
              download="Humidor411-MasterDatabase.xlsx"
              className="flex h-9 shrink-0 items-center justify-center gap-2 rounded border border-[#D6AA50] px-3 text-[11px] font-semibold text-[#F4D77B] hover:bg-[#D6AA50]/10"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
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
            className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#D6AA50]/60 bg-[#342315]/45 px-5 text-center transition hover:bg-[#D6AA50]/10"
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
                  Required columns: name, brand
                </span>
              </>
            )}
          </button>
          <p className="text-[11px] leading-5 text-[#CDB37A]">
            Supported columns: name, brand, description, manufacturer, country,
            price, status. Status can be active, under_review, out_of_stock, or
            inactive; it defaults to active when omitted.
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
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
              {pending ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
