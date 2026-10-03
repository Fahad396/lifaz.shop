"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/plp/ProductCard";

interface FeaturedCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
}

export function FeaturedCarousel({
  products,
  title = "READY-TO-WEAR // LATEST CAPSULE",
  subtitle = "Engineered in our Dhaka atelier. Nationwide insured courier delivery.",
  viewAllLink = "/collections/all",
}: FeaturedCarouselProps) {
  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white border-b border-black/10 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 sm:pb-12">
          <div>
            <span className="text-[10px] font-bold tracking-khy-ultra text-black/50 uppercase block mb-1.5">
              ATELIER SELECTION
            </span>
            <h2 className="font-sans font-black text-xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-black leading-tight text-balance">
              {title}
            </h2>
            <p className="text-xs text-black/60 mt-1 max-w-md text-balance">
              {subtitle}
            </p>
          </div>

          <div>
            <Link
              href={viewAllLink}
              className="text-xs font-bold tracking-khy-wide uppercase text-black hover:opacity-70 transition-opacity flex items-center gap-1.5"
            >
              <span>VIEW ARCHIVE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-black/15 p-8">
            <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block mb-2">
              CATALOG VAULT
            </span>
            <h3 className="font-sans font-black text-lg uppercase tracking-tight text-black">
              NEW ATELIER PIECES IN PRODUCTION
            </h3>
            <p className="text-xs font-mono text-black/50 mt-1 max-w-sm mx-auto">
              Garments will appear here once published in the Atelier Studio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 4).map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 2}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
