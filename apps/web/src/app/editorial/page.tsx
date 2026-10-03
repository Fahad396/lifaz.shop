import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Editorial Campaign Lookbook // LIFAZ Dhaka Atelier",
  description: "Autumn/Winter Campaign Sessions photographed in Dhaka.",
};

const LOOKBOOK_SPREADS = [
  {
    chapter: "CHAPTER 01",
    title: "THE RAW MINIMALISM MANIFESTO",
    subtitle: "Heavyweight Vegan Leather & Sculpted Overcoats",
    quote: "“Proportion is not an accident. It is an architectural discipline.”",
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1600&auto=format&fit=crop",
    details: "Shot on location at the Dhaka Atelier. Garment 01 features bonded polyurethane construction with oversized storm flaps.",
    link: "/collections/drop-001",
  },
  {
    chapter: "CHAPTER 02",
    title: "SHADOW & STRUCTURE",
    subtitle: "Tropical Wool Tailoring & Exaggerated Shoulders",
    quote: "“Fabric holds memory. We shape it into armor for the modern world.”",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop",
    details: "Hand-finished buttonholes and floating canvas interlining tailored by master patternmakers in Dhaka.",
    link: "/collections/tailoring",
  },
  {
    chapter: "CHAPTER 03",
    title: "THE DRAPE BLUEPRINT",
    subtitle: "Silk Crepe & Bias-Cut Silhouette Studies",
    quote: "“Fluidity requires structure beneath the surface.”",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop",
    details: "Sculpted eveningwear and asymmetric silk silhouettes crafted for nocturnal events.",
    link: "/collections/dresses",
  },
];

export default function EditorialPage() {
  return (
    <div className="min-h-screen pt-28 pb-32 bg-[#0A0A0A] text-[#F4F3ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-monumental uppercase text-[#C5A059] mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Autumn / Winter Campaign</span>
          </div>
          <h1 className="font-editorial-serif text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider text-white mb-4 font-light">
            Editorial Lookbook
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
            A photographic study in form, proportion, and textile tension. Engineered in Dhaka, Bangladesh.
          </p>
        </div>

        {/* Spreads */}
        <div className="space-y-28">
          {LOOKBOOK_SPREADS.map((spread, idx) => (
            <article
              key={spread.chapter}
              className={`flex flex-col ${
                idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-10 lg:gap-16 items-center`}
            >
              {/* Image Frame */}
              <div className="w-full lg:w-3/5 aspect-[4/5] relative bg-[#111111] overflow-hidden rounded-xs border border-white/10 shadow-2xl">
                <Image
                  src={spread.image}
                  alt={spread.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>

              {/* Text Meta */}
              <div className="w-full lg:w-2/5 space-y-6">
                <span className="text-[10px] tracking-monumental uppercase text-[#C5A059]">
                  {spread.chapter}
                </span>

                <h2 className="font-editorial-serif text-2xl sm:text-3xl uppercase tracking-wide text-white">
                  {spread.title}
                </h2>

                <p className="text-xs tracking-wider uppercase text-white/50">
                  {spread.subtitle}
                </p>

                <blockquote className="font-editorial-serif italic text-lg sm:text-xl text-white/90 border-l-2 border-[#C5A059] pl-4 py-1">
                  {spread.quote}
                </blockquote>

                <p className="text-xs text-white/60 leading-relaxed">
                  {spread.details}
                </p>

                <div className="pt-4">
                  <Link
                    href={spread.link}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black text-xs font-medium tracking-monumental uppercase hover:bg-white/90 transition-colors"
                  >
                    <span>Inspect Capsule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
