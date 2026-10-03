"use client";

import React, { useState, useEffect } from "react";
import { Search as SearchIcon, X, Sparkles } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/plp/ProductCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load catalog for search", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filtered = products.filter((p) => {
    const matchesQuery =
      query.trim() === "" ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase()) ||
      p.color?.toLowerCase().includes(query.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      p.category?.toLowerCase() === activeCategory.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#F4F3ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar Header */}
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
          <div>
            <span className="text-[10px] tracking-monumental text-black/50 uppercase block mb-1">
              Atelier Vault Discovery
            </span>
            <h1 className="font-editorial-serif text-3xl sm:text-4xl uppercase tracking-wide text-black">
              Archive Search Engine
            </h1>
          </div>

          <div className="relative flex items-center bg-white border border-black/20 rounded-xs shadow-xs focus-within:border-black transition-colors overflow-hidden">
            <SearchIcon className="w-5 h-5 text-black/40 ml-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search garments by silhouette, fabric, color, or drop..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full px-4 py-4 text-sm text-black placeholder-black/40 bg-transparent focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-2 mr-2 text-black/40 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {["All", "Outerwear", "Tailoring", "Dresses", "Tops", "Bottoms", "Drop 001"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xs transition-colors border cursor-pointer ${
                    activeCategory === cat
                      ? "bg-black text-white border-black font-semibold"
                      : "bg-white text-black/70 border-black/15 hover:border-black"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Search Results */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-8 text-xs text-black/60">
            <span>
              {filtered.length} {filtered.length === 1 ? "result" : "results"} found
              {query && ` for "${query}"`}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center bg-[#EFECE6] border border-black/10 rounded-xs p-8 max-w-lg mx-auto">
              <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto mb-3" />
              <h3 className="font-editorial-serif text-xl uppercase tracking-wider mb-2">
                No Garments Found
              </h3>
              <p className="text-xs text-black/60">
                Try searching with broader terms like "Leather", "Trench", "Wool", or explore our complete archive.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
