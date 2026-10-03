"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const defaultImages =
    images && images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1200&auto=format&fit=crop",
        ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
      {/* Thumbnail Navigation Rail (Desktop) */}
      {defaultImages.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[640px] flex-shrink-0 pb-2 lg:pb-0">
          {defaultImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 sm:w-20 aspect-[3/4] bg-[#EFECE6] overflow-hidden rounded-xs border transition-all cursor-pointer flex-shrink-0 ${
                activeIndex === idx
                  ? "border-black ring-1 ring-black"
                  : "border-black/10 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${title} view ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Feature Image */}
      <div className="relative flex-1 aspect-[3/4] bg-[#EFECE6] overflow-hidden rounded-xs border border-black/10 shadow-xs">
        <Image
          src={defaultImages[activeIndex] || defaultImages[0]}
          alt={`${title} main view`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>
    </div>
  );
}
