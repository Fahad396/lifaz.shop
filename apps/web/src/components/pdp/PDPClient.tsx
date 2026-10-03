"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ruler,
  ShoppingBag,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";
import { ProductGallery } from "@/components/pdp/ProductGallery";
import { StickyATC } from "@/components/pdp/StickyATC";
import { SizingGuideModal } from "@/components/pdp/SizingGuideModal";

interface PDPClientProps {
  product: Product;
}

export function PDPClient({ product }: PDPClientProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.[0]?.size || "M"
  );
  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false);
  const [added, setAdded] = useState(false);

  // Accordions
  const [openSection, setOpenSection] = useState<string | null>("fabrication");

  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  const handleAddToCart = () => {
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

  const currentVariant = product.variants?.find((v) => v.size === selectedSize);
  const inStock = currentVariant ? currentVariant.inStock : true;

  return (
    <div className="min-h-screen pt-24 pb-32 bg-white text-black">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-khy-wide uppercase text-black/50 mb-6">
          <Link href="/collections/all" className="hover:text-black transition-colors">
            ARCHIVE
          </Link>
          <span>/</span>
          <Link
            href={`/collections/${product.category?.toLowerCase() || "all"}`}
            className="hover:text-black transition-colors"
          >
            {product.category || "GARMENTS"}
          </Link>
          <span>/</span>
          <span className="text-black font-bold">{product.title}</span>
        </div>

        {/* 2-Column Split PDP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left: Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          {/* Right: Product Details & Purchase Panel */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            {/* Header */}
            <div>
              {product.drop && (
                <span className="text-[10px] font-bold tracking-khy-ultra text-black/50 uppercase block mb-1.5">
                  {product.drop}
                </span>
              )}

              <h1 className="font-sans font-black text-2xl sm:text-4xl uppercase tracking-tight text-black mb-3">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-4 mt-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-black">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm font-mono text-black/40 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase bg-black/5 text-black/70 px-2 py-0.5">
                  VAT INCLUSIVE // BDT
                </span>
              </div>
            </div>

            {/* Colorway */}
            <div className="pt-3 pb-3 border-y border-black/10 flex items-center justify-between text-xs">
              <span className="text-black/60 uppercase tracking-wider">COLORWAY:</span>
              <span className="font-bold uppercase tracking-wider text-black">
                {product.color || "BLACK"}
              </span>
            </div>

            {/* Size Selector & Sizing Blueprint */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold tracking-khy-wide uppercase text-black">
                  SELECT SIZE
                </span>
                <button
                  onClick={() => setIsSizingModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold tracking-khy-wide uppercase text-black hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>SIZING GUIDE</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {(product.variants && product.variants.length > 0
                  ? product.variants
                  : [
                      { id: "xs", size: "XS", inStock: true },
                      { id: "s", size: "S", inStock: true },
                      { id: "m", size: "M", inStock: true },
                      { id: "l", size: "L", inStock: true },
                      { id: "xl", size: "XL", inStock: true },
                    ]
                ).map((v) => (
                  <button
                    key={v.size}
                    disabled={!v.inStock}
                    onClick={() => setSelectedSize(v.size)}
                    className={`py-3.5 text-xs font-mono font-bold uppercase transition-all flex flex-col items-center justify-center cursor-pointer ${
                      selectedSize === v.size
                        ? "bg-black text-white"
                        : v.inStock
                        ? "bg-white text-black border border-black/30 hover:border-black"
                        : "bg-black/5 text-black/30 cursor-not-allowed line-through"
                    }`}
                  >
                    <span>{v.size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Add to Bag */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || added}
                className={`w-full py-4 text-xs font-bold tracking-khy-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  added
                    ? "bg-[#C5A059] text-black"
                    : inStock
                    ? "bg-black text-white hover:bg-black/85"
                    : "bg-black/20 text-black/40 cursor-not-allowed"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADDED TO BAG ({selectedSize})</span>
                  </>
                ) : inStock ? (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO BAG // {formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span>SOLD OUT</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-black/60 text-center pt-2 font-mono uppercase">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>64-District Courier</span>
                </span>
                <span>//</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>7-Day Sizing Desk</span>
                </span>
              </div>
            </div>

            {/* Description & Technical Accordions */}
            <div className="border-t border-black/10 pt-6 space-y-4 text-xs">
              <p className="text-black/80 leading-relaxed">
                {product.description}
              </p>

              <div className="border-t border-black/10 pt-3">
                <button
                  onClick={() => toggleSection("fabrication")}
                  className="w-full flex items-center justify-between py-2 text-left font-bold tracking-khy-wide uppercase text-black cursor-pointer"
                >
                  <span>FABRICATION & DETAILS</span>
                  {openSection === "fabrication" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openSection === "fabrication" && (
                  <div className="pt-2 pb-4 space-y-3 text-black/70 leading-relaxed">
                    {product.fabrication && product.fabrication.length > 0 && (
                      <div>
                        <span className="font-bold text-black uppercase text-[10px] block mb-1">
                          COMPOSITION:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {product.fabrication.map((fab, i) => (
                            <li key={i}>{fab}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product.details && product.details.length > 0 && (
                      <div className="pt-1">
                        <span className="font-bold text-black uppercase text-[10px] block mb-1">
                          CONSTRUCTION FEATURES:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {product.details.map((det, i) => (
                            <li key={i}>{det}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-black/10 pt-3">
                <button
                  onClick={() => toggleSection("delivery")}
                  className="w-full flex items-center justify-between py-2 text-left font-bold tracking-khy-wide uppercase text-black cursor-pointer"
                >
                  <span>LOGISTICS & PAYMENT OPTIONS</span>
                  {openSection === "delivery" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openSection === "delivery" && (
                  <div className="pt-2 pb-4 space-y-2 text-black/70 leading-relaxed">
                    <p>
                      <strong>Inside Dhaka:</strong> ৳60 Delivery (1–3 days).
                    </p>
                    <p>
                      <strong>Outside Dhaka:</strong> ৳130 Insured Courier (2–3 days all over Bangladesh).
                    </p>
                    <p>
                      <strong>Payment Gateways:</strong> Cash on Delivery (COD), bKash, Nagad, Visa, Mastercard.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StickyATC
        product={product}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
      />

      <SizingGuideModal
        isOpen={isSizingModalOpen}
        onClose={() => setIsSizingModalOpen(false)}
        product={product}
      />
    </div>
  );
}
