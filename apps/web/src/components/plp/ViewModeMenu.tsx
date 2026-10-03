"use client";

import React from "react";
import { SlidersHorizontal, LayoutGrid, Grid3X3, Grid2X2, BookOpen } from "lucide-react";

export type ViewMode = "2-col" | "3-col" | "4-col" | "editorial";

interface ViewModeMenuProps {
  totalCount: number;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onToggleFilter: () => void;
  isFilterOpen: boolean;
}

export function ViewModeMenu({
  totalCount,
  viewMode,
  onSelectViewMode,
  onToggleFilter,
  isFilterOpen,
}: ViewModeMenuProps) {
  return (
    <div className="sticky top-[69px] z-30 w-full bg-[#F4F3ED]/95 backdrop-blur-md border-y border-black/10 py-3 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Filter Trigger & Count */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleFilter}
            className={`flex items-center gap-2 text-xs font-medium tracking-monumental uppercase px-3 py-1.5 rounded-xs border transition-colors cursor-pointer ${
              isFilterOpen
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black/20 hover:border-black"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isFilterOpen ? "Hide Filters" : "Filter & Sort"}</span>
          </button>

          <span className="text-xs font-mono text-black/50">
            ({totalCount} {totalCount === 1 ? "piece" : "pieces"})
          </span>
        </div>

        {/* Right: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xs border border-black/15">
          <button
            onClick={() => onSelectViewMode("2-col")}
            title="2 Column Grid"
            className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
              viewMode === "2-col" ? "bg-black text-white" : "text-black/50 hover:text-black"
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectViewMode("3-col")}
            title="3 Column Grid"
            className={`hidden sm:block p-1.5 rounded-xs transition-colors cursor-pointer ${
              viewMode === "3-col" ? "bg-black text-white" : "text-black/50 hover:text-black"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectViewMode("4-col")}
            title="4 Column Grid"
            className={`hidden lg:block p-1.5 rounded-xs transition-colors cursor-pointer ${
              viewMode === "4-col" ? "bg-black text-white" : "text-black/50 hover:text-black"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectViewMode("editorial")}
            title="Editorial Lookbook View"
            className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
              viewMode === "editorial" ? "bg-black text-white" : "text-black/50 hover:text-black"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
