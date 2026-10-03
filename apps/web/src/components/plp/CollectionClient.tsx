"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, Drop } from "@/lib/types";
import { ProductCard } from "@/components/plp/ProductCard";
import { FilterSidebar } from "@/components/plp/FilterSidebar";
import { ViewModeMenu, ViewMode } from "@/components/plp/ViewModeMenu";
import { formatPrice } from "@/lib/currency";

interface CollectionClientProps {
  initialProducts: Product[];
  categories: string[];
  currentDrop?: Drop;
  title: string;
  description: string;
}

export function CollectionClient({
  initialProducts,
  categories,
  currentDrop,
  title,
  description,
}: CollectionClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedColor, setSelectedColor] = useState<string>("All Colors");
  const [selectedSize, setSelectedSize] = useState<string>("All Sizes");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("3-col");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedColor !== "All Colors") {
      result = result.filter((p) =>
        p.color?.toLowerCase().includes(selectedColor.toLowerCase())
      );
    }

    if (selectedSize !== "All Sizes") {
      result = result.filter((p) =>
        p.variants?.some((v) => v.size === selectedSize && v.inStock)
      );
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [initialProducts, selectedCategory, selectedColor, selectedSize, sortBy]);

  const handleClearAll = () => {
    setSelectedCategory("All");
    setSelectedColor("All Colors");
    setSelectedSize("All Sizes");
    setSortBy("newest");
  };

  const getGridClasses = () => {
    if (viewMode === "2-col") return "grid grid-cols-1 sm:grid-cols-2 gap-6";
    if (viewMode === "3-col") return "grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6";
    if (viewMode === "4-col") return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6";
    return "flex flex-col space-y-20";
  };

  return (
    <div className="min-h-screen pt-24 pb-28 bg-white text-black">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 mb-8">
        {currentDrop ? (
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/7] overflow-hidden mb-8 bg-black">
            {currentDrop.heroImage ? (
              <Image
                src={currentDrop.heroImage}
                alt={currentDrop.title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
              <span className="text-[10px] font-bold tracking-khy-ultra uppercase text-white/70 mb-1">
                CAPSULE DROP // 00{currentDrop.dropNumber}
              </span>
              <h1 className="font-sans font-black text-2xl sm:text-5xl uppercase tracking-tight mb-2">
                {currentDrop.name || currentDrop.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl line-clamp-2">
                {currentDrop.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl py-4">
            <span className="text-[10px] font-bold tracking-khy-ultra text-black/50 uppercase block mb-1">
              ATELIER ARCHIVE
            </span>
            <h1 className="font-sans font-black text-3xl sm:text-5xl uppercase tracking-tight text-black mb-2">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Sticky View Mode Menu */}
      <ViewModeMenu
        totalCount={filteredProducts.length}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        isFilterOpen={isFilterOpen}
      />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex gap-8">
          {isFilterOpen && (
            <aside className="hidden md:block w-64 flex-shrink-0 bg-white p-6 border border-black/10 h-fit sticky top-[130px]">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                sortBy={sortBy}
                onSelectSort={setSortBy}
                onClearAll={handleClearAll}
              />
            </aside>
          )}

          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center bg-[#F9F9F9] p-8 max-w-md mx-auto">
                <h3 className="font-sans font-bold text-lg uppercase tracking-wide mb-2">
                  No Garments in this Selection
                </h3>
                <p className="text-xs text-black/60 mb-6">
                  Reset your filters to view the complete ready-to-wear archive.
                </p>
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 bg-black text-white text-xs font-bold tracking-khy-wide uppercase"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : viewMode === "editorial" ? (
              <div className="space-y-24">
                {filteredProducts.map((p, index) => (
                  <div
                    key={p.id}
                    className={`flex flex-col ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    } gap-12 items-center bg-[#F9F9F9] p-8 sm:p-12`}
                  >
                    <div className="w-full lg:w-1/2 aspect-[3/4] relative bg-white overflow-hidden">
                      <Image
                        src={p.images?.[0] || "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop"}
                        alt={p.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="w-full lg:w-1/2 space-y-4">
                      <span className="text-[10px] font-bold tracking-khy-ultra text-black/50 uppercase">
                        {p.drop || "READY-TO-WEAR"}
                      </span>
                      <h3 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
                        {p.title}
                      </h3>
                      <div className="font-mono text-xl font-bold text-black">
                        {formatPrice(p.price)}
                      </div>
                      <p className="text-xs text-black/70 leading-relaxed">
                        {p.description}
                      </p>
                      <Link
                        href={`/products/${p.slug || p.id}`}
                        className="inline-block px-8 py-3.5 bg-black text-white text-xs font-bold tracking-khy-wide uppercase hover:bg-black/85 transition-colors mt-4"
                      >
                        INSPECT GARMENT
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={getGridClasses()}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
