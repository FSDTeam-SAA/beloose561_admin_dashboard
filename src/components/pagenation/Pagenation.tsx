"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page?: number;
  limit?: number;
  total?: number;
  currentCount?: number;
  onPageChange?: (page: number) => void;
  disabled?: boolean;
}

function Pagination({
  page = 1,
  limit = 10,
  total = 0,
  currentCount = 0,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startItem = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const fallbackCount = total === 0 ? 0 : Math.min(limit, total - startItem + 1);
  const visibleCount = currentCount > 0 ? currentCount : fallbackCount;
  const endItem = total === 0 ? 0 : Math.min(total, startItem + visibleCount - 1);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages =
    totalPages <= 4
      ? pages
      : Array.from(
          new Set([1, Math.max(1, page - 1), page, Math.min(totalPages, page + 1), totalPages]),
        ).sort((a, b) => a - b);

  const handlePageChange = (nextPage: number) => {
    if (disabled || nextPage < 1 || nextPage > totalPages || nextPage === safePage) {
      return;
    }

    onPageChange?.(nextPage);
  };

  return (
    <div className="mt-1 flex flex-col gap-4 text-sm text-[#9A8060] sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs font-medium">
        Showing {startItem} to {endItem} of {total} results
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          disabled={disabled || safePage <= 1}
          onClick={() => handlePageChange(safePage - 1)}
          aria-label="Go to previous page"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded border border-[#CBA24A]/35 bg-[#1C120C] text-[#CBA24A] transition-colors enabled:hover:border-[#CBA24A] enabled:hover:bg-[#CBA24A]/10 enabled:hover:text-[#F7E4B3] disabled:cursor-not-allowed disabled:border-[#705929]/30 disabled:bg-[#140D09]/40 disabled:text-[#705929]/60"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {visiblePages.map((pageNumber, index) => {
          const previousPage = visiblePages[index - 1];
          const showDots = previousPage && pageNumber - previousPage > 1;

          return (
            <React.Fragment key={pageNumber}>
              {showDots ? <span className="px-1 text-[#705929]">...</span> : null}
              <button
                type="button"
                disabled={disabled || pageNumber === safePage}
                onClick={() => handlePageChange(pageNumber)}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={pageNumber === safePage ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded border text-xs font-semibold transition-colors ${
                  pageNumber === safePage
                    ? "cursor-default border-[#CBA24A] bg-[#CBA24A] text-[#140D09] shadow-[0_0_10px_rgba(203,162,74,0.18)]"
                    : "cursor-pointer border-[#CBA24A]/35 bg-[#1C120C] text-[#9A8060] enabled:hover:border-[#CBA24A] enabled:hover:bg-[#CBA24A]/10 enabled:hover:text-[#F7E4B3] disabled:cursor-not-allowed disabled:border-[#705929]/30 disabled:bg-[#140D09]/40 disabled:text-[#705929]/60"
                }`}
              >
                {pageNumber}
              </button>
            </React.Fragment>
          );
        })}

        <button
          type="button"
          disabled={disabled || safePage >= totalPages}
          onClick={() => handlePageChange(safePage + 1)}
          aria-label="Go to next page"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded border border-[#CBA24A]/35 bg-[#1C120C] text-[#CBA24A] transition-colors enabled:hover:border-[#CBA24A] enabled:hover:bg-[#CBA24A]/10 enabled:hover:text-[#F7E4B3] disabled:cursor-not-allowed disabled:border-[#705929]/30 disabled:bg-[#140D09]/40 disabled:text-[#705929]/60"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
