"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HeroSettings } from "@/lib/types";

interface HeroProps {
  settings?: HeroSettings;
}

export function Hero({ settings }: HeroProps) {
  const hero = settings || {
    bannerTag: "CAPSULE DROP 001 // NOW ACTIVE",
    showBannerTag: true,
    title: "FAUX LEATHER & MOTO",
    subtitle: "Sculpted silhouettes, bonded outerwear, and Dhaka atelier craftsmanship.",
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=2000&auto=format&fit=crop",
    ctaPrimaryText: "SHOP DROP 001",
    ctaPrimaryLink: "/collections/drop-001",
    ctaSecondaryText: "VIEW ALL PIECES",
    ctaSecondaryLink: "/collections/all",
    headlineSize: "monumental",
    headlineFontSizeRem: 5.5,
    headlineTracking: "wide",
    headlineAlign: "center",
    headlineColor: "#FFFFFF",
    headlineTransform: "uppercase",
    headlineLineHeight: 0.95,
    headlineShadow: "subtle",
    photoZoom: 100,
    photoBrightness: 90,
    photoContrast: 105,
    photoPosition: "center",
    photoFilter: "none",
  };

  const getFilterStyle = () => {
    let base = `brightness(${hero.photoBrightness ?? 90}%) contrast(${hero.photoContrast ?? 105}%)`;
    if (hero.photoFilter === "monochrome") base += " grayscale(100%)";
    if (hero.photoFilter === "warm") base += " sepia(30%) saturate(120%)";
    if (hero.photoFilter === "cool") base += " hue-rotate(180deg) saturate(90%)";
    if (hero.photoFilter === "contrast") base += " contrast(140%) saturate(110%)";
    return base;
  };

  return (
    <section className="relative w-full min-h-[100svh] sm:min-h-[700px] flex items-end justify-center overflow-hidden bg-black text-white">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        {hero.image ? (
          <Image
            src={hero.image}
            alt={hero.title || "LIFAZ Atelier"}
            fill
            priority
            sizes="100vw"
            className="object-cover transition-transform duration-1000"
            style={{
              objectPosition: hero.photoPosition || "center",
              transform: `scale(${(hero.photoZoom ?? 100) / 100})`,
              filter: getFilterStyle(),
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-neutral-900 via-black to-black" />
        )}
        {/* Cinematic Editorial Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/40" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20 text-center flex flex-col items-center">
        {/* Banner Tag */}
        {hero.showBannerTag && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block text-[10px] sm:text-[11px] font-semibold tracking-khy-ultra uppercase text-white/90 mb-3 px-2"
          >
            {hero.bannerTag}
          </motion.div>
        )}

        {/* Monumental Modern Sans Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans font-black text-3xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[1.12] sm:leading-[1.0] md:leading-[0.95] text-white drop-shadow-lg mb-3 sm:mb-4 max-w-5xl text-balance break-words px-2"
        >
          {hero.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs sm:text-sm text-white/80 max-w-lg font-normal tracking-wide leading-relaxed mb-6 sm:mb-8 px-4 text-balance"
        >
          {hero.subtitle}
        </motion.p>

        {/* Minimal KHY CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4 sm:px-0"
        >
          <Link
            href={hero.ctaPrimaryLink}
            className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] px-7 py-3.5 bg-white text-black text-xs font-bold tracking-khy-wide uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2"
          >
            <span>{hero.ctaPrimaryText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={hero.ctaSecondaryLink}
            className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] px-7 py-3.5 bg-transparent border border-white/60 text-white text-xs font-bold tracking-khy-wide uppercase hover:bg-white hover:text-black transition-all text-center"
          >
            {hero.ctaSecondaryText}
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
