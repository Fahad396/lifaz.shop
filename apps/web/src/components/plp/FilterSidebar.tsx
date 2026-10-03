"use client";

import React from "react";
import { X, Check } from "lucide-react";

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  sortBy: string;
  onSelectSort: (sort: string) => void;
  onClearAll: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const COLORS = ["All Colors", "Black", "Deep Black", "Ecru", "Brown", "Charcoal", "Cream"];
const SIZES = ["All Sizes", "XS", "S", "M", "L", "XL"];
const SORTS = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export function FilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedColor,
  onSelectColor,
  selectedSize,
  onSelectSize,
  sortBy,
  onSelectSort,
  onClearAll,
  isOpen = true,
  onClose,
}: FilterSidebarProps) {
  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedColor !== "All Colors" ||
    selectedSize !== "All Sizes";

  return (
    <div className="w-full space-y-8 text-xs">
      {/* Header for Mobile Drawer */}
      {onClose && (
        <div className="flex items-center justify-between pb-4 border-b border-black/10">
          <span className="font-medium tracking-monumental uppercase text-black">
            Filter Archive
          </span>
          <button
            onClick={onClose}
            className="p-1 text-black/60 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <span className="text-[11px] text-black/60">Active Filters Applied</span>
          <button
            onClick={onClearAll}
            className="text-[11px] text-[#9E2A2B] uppercase tracking-wider hover:opacity-75 transition-opacity font-medium cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Sort By */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-medium tracking-monumental uppercase text-black/80">
          Sort By
        </h4>
        <div className="space-y-1.5">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => onSelectSort(s.value)}
              className={`w-full text-left py-1 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                sortBy === s.value
                  ? "text-black font-semibold"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <span>{s.label}</span>
              {sortBy === s.value && <Check className="w-3.5 h-3.5 text-black" />}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-medium tracking-monumental uppercase text-black/80">
          Category
        </h4>
        <div className="space-y-1.5">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`w-full text-left py-1 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                selectedCategory === cat
                  ? "text-black font-semibold"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <span>{cat}</span>
              {selectedCategory === cat && (
                <Check className="w-3.5 h-3.5 text-black" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-medium tracking-monumental uppercase text-black/80">
          Size
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((sz) => (
            <button
              key={sz}
              onClick={() => onSelectSize(sz)}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors border cursor-pointer ${
                selectedSize === sz
                  ? "bg-black text-white border-black"
                  : "bg-white text-black/70 border-black/15 hover:border-black/40"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-medium tracking-monumental uppercase text-black/80">
          Color Palette
        </h4>
        <div className="space-y-1.5">
          {COLORS.map((col) => (
            <button
              key={col}
              onClick={() => onSelectColor(col)}
              className={`w-full text-left py-1 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                selectedColor === col
                  ? "text-black font-semibold"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <span>{col}</span>
              {selectedColor === col && (
                <Check className="w-3.5 h-3.5 text-black" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
