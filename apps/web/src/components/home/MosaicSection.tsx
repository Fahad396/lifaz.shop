"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { MosaicSettings } from "@/lib/types";

interface MosaicSectionProps {
  settings?: MosaicSettings;
}

const DEFAULT_MOSAIC_DATA: MosaicSettings = {
  tag: "ARCHITECTURAL PROPORTION & DRAPE",
  title: "SCULPTED MINIMALISM",
  description:
    "Constructed with bonded faux leather and structured tailoring. Every garment is engineered in our Dhaka atelier for fluid movement and dramatic silhouette.",
  leftImage: "",
  leftTag: "CAPSULE DROP // STUDY",
  leftTitle: "BONDED VEGAN LEATHER",
  leftCtaText: "EXPLORE ALL PIECES",
  leftCtaLink: "/collections/all",
  rightImage: "",
  rightTag: "RUNWAY ARCHIVE",
  rightTitle: "THE DHAKA SESSIONS",
  callout1Tag: "7-DAY SIZING DESK",
  callout1Title: "Complimentary Swap",
  callout1Description: "Doorstep size exchange available across all 64 districts.",
  callout1Link: "/pages/faq",
  callout1LinkText: "LEARN MORE",
  callout2Tag: "64-DISTRICT COURIER",
  callout2Title: "Insured Shipping",
  callout2Description: "Same-day VIP concierge in Dhaka, and 48-hour nationwide delivery.",
  callout2Link: "/pages/shipping",
  callout2LinkText: "DELIVERY MATRIX",
};

export function MosaicSection({ settings }: MosaicSectionProps) {
  const mosaic = settings || DEFAULT_MOSAIC_DATA;

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[#F9F9F9] border-b border-black/10 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-10 sm:mb-16">
          <span className="text-[10px] font-bold tracking-khy-ultra text-black/50 uppercase block mb-2">
            {mosaic.tag}
          </span>
          <h2 className="font-sans font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-black leading-tight text-balance">
            {mosaic.title}
          </h2>
          <p className="text-xs sm:text-sm text-black/60 mt-2 sm:mt-3 leading-relaxed text-balance">
            {mosaic.description}
          </p>
        </div>

        {/* Asymmetric 2-Column Split Magazine Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Panel 1: Tall Left Hero Spread */}
          <div className="lg:col-span-6 relative aspect-[3/4] bg-black overflow-hidden group">
            {mosaic.leftImage ? (
              <Image
                src={mosaic.leftImage}
                alt={mosaic.leftTitle || "Sculpted Minimalism Left Spread"}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
              <span className="text-[10px] font-bold tracking-khy-ultra uppercase text-white/70 mb-1.5">
                {mosaic.leftTag}
              </span>
              <h3 className="font-sans font-black text-xl sm:text-3xl lg:text-4xl uppercase tracking-tight leading-snug sm:leading-tight mb-3 text-balance">
                {mosaic.leftTitle}
              </h3>
              <Link
                href={mosaic.leftCtaLink || "/collections/all"}
                className="inline-flex items-center gap-2 text-xs font-bold tracking-khy-wide uppercase text-white hover:opacity-70 transition-opacity"
              >
                <span>{mosaic.leftCtaText || "EXPLORE PIECES"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Panel 2: Right Stacked Spread */}
          <div className="lg:col-span-6 flex flex-col gap-6 lg:gap-8">
            <div className="relative aspect-[16/10] bg-black overflow-hidden group">
              {mosaic.rightImage ? (
                <Image
                  src={mosaic.rightImage}
                  alt={mosaic.rightTitle || "Sculpted Minimalism Right Spread"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-[10px] font-bold tracking-khy-ultra uppercase text-white/70 mb-1">
                  {mosaic.rightTag}
                </span>
                <h3 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-tight leading-snug text-balance">
                  {mosaic.rightTitle}
                </h3>
              </div>
            </div>

            {/* 2 Feature Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 sm:p-6 bg-white border border-black/10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-khy-ultra uppercase text-black/50 block mb-2">
                    {mosaic.callout1Tag}
                  </span>
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wide text-black mb-1.5 leading-snug">
                    {mosaic.callout1Title}
                  </h4>
                  <p className="text-xs text-black/60 leading-relaxed">
                    {mosaic.callout1Description}
                  </p>
                </div>
                <Link
                  href={mosaic.callout1Link || "/pages/faq"}
                  className="mt-4 text-[10px] font-bold tracking-khy-wide uppercase text-black hover:opacity-70 transition-opacity inline-flex items-center gap-1"
                >
                  <span>{mosaic.callout1LinkText || "LEARN MORE"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-5 sm:p-6 bg-black text-white flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-khy-ultra uppercase text-white/70 block mb-2">
                    {mosaic.callout2Tag}
                  </span>
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wide text-white mb-1.5 leading-snug">
                    {mosaic.callout2Title}
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {mosaic.callout2Description}
                  </p>
                </div>
                <Link
                  href={mosaic.callout2Link || "/pages/shipping"}
                  className="mt-4 text-[10px] font-bold tracking-khy-wide uppercase text-white/80 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>{mosaic.callout2LinkText || "DELIVERY MATRIX"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
