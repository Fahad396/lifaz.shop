"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";

interface StickyATCProps {
  product: Product;
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export function StickyATC({
  product,
  selectedSize,
  onSelectSize,
}: StickyATCProps) {
  const { addToCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once user has scrolled past main CTA (350px)
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      color: product.color || "Black",
      image: product.images?.[0] || "",
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 inset-x-0 z-40 bg-[#F4F3ED]/95 backdrop-blur-md border-t border-black/15 py-3 px-4 sm:px-6 lg:px-8 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Thumbnail and Title */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-14 bg-black/5 overflow-hidden rounded-xs border border-black/10 flex-shrink-0">
                <Image
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=400&auto=format&fit=crop"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h4 className="text-xs font-medium uppercase tracking-wide text-black line-clamp-1">
                  {product.title}
                </h4>
                <div className="text-xs font-mono font-semibold text-black">
                  {formatPrice(product.price)}
                </div>
              </div>
            </div>

            {/* Right: Size Pill Selector & ATC Button */}
            <div className="flex items-center gap-3">
              {product.variants && product.variants.length > 0 && (
                <div className="flex items-center gap-1">
                  {product.variants.map((v) => (
                    <button
                      key={v.id || v.size}
                      onClick={() => onSelectSize(v.size)}
                      className={`px-2.5 py-1.5 text-[10px] font-mono uppercase rounded-xs transition-colors cursor-pointer ${
                        selectedSize === v.size
                          ? "bg-black text-white font-bold"
                          : "bg-white text-black/70 border border-black/15 hover:border-black"
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={added}
                className={`px-6 sm:px-8 py-2.5 text-xs font-medium tracking-monumental uppercase rounded-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap ${
                  added
                    ? "bg-[#C5A059] text-black font-semibold"
                    : "bg-[#0A0A0A] text-[#F4F3ED] hover:bg-black/80"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added ({selectedSize})</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag // {formatPrice(product.price)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
