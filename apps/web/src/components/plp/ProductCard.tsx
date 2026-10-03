"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.[0]?.size || "M"
  );
  const [added, setAdded] = useState(false);

  const primaryImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop";
  const hoverImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      color: product.color || "Black",
      image: primaryImage,
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame (Borderless KHY Aesthetic) */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="relative w-full aspect-[3/4] bg-[#F3F3F3] overflow-hidden block"
      >
        <Image
          src={isHovered && product.images?.[1] ? hoverImage : primaryImage}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Minimal Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-bold tracking-khy-wide uppercase bg-black text-white px-2.5 py-1">
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
          <div className="p-2 bg-white/95 backdrop-blur-md border border-black/10 space-y-2 shadow-lg">
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-0.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id || v.size}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(v.size);
                    }}
                    className={`text-[10px] px-2.5 py-1 font-mono uppercase transition-colors cursor-pointer ${
                      selectedSize === v.size
                        ? "bg-black text-white font-bold"
                        : "bg-black/5 text-black/70 hover:bg-black/10"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleQuickAdd}
              disabled={added}
              className={`w-full py-2.5 text-[10px] font-bold tracking-khy-wide uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                added
                  ? "bg-[#C5A059] text-black"
                  : "bg-black text-white hover:bg-black/85"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>ADDED ({selectedSize})</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>QUICK ADD ({selectedSize})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Clean KHY Typography Meta */}
      <div className="pt-3 pb-2 flex flex-col space-y-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            href={`/products/${product.slug || product.id}`}
            className="text-xs font-bold uppercase tracking-wide text-black hover:opacity-70 transition-opacity line-clamp-1"
          >
            {product.title}
          </Link>
          <span className="text-xs font-medium text-black whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="text-[11px] text-black/50">
          {product.color}
        </div>
      </div>
    </div>
  );
}
