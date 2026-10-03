"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { Drop } from "@/lib/types";

interface DropsShowcaseProps {
  drops: Drop[];
}

export function DropsShowcase({ drops }: DropsShowcaseProps) {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-white border-b border-black/10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="max-w-2xl mb-10 sm:mb-16">
          <span className="text-[10px] font-bold tracking-khy-ultra text-black/50 uppercase block mb-2">
            SEASONAL CHAPTERS
          </span>
          <h2 className="font-sans font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-black leading-tight text-balance">
            CAPSULE DROPS
          </h2>
          <p className="text-xs sm:text-sm text-black/60 mt-2 sm:mt-3 leading-relaxed text-balance">
            Numbered capsule collections released in strictly limited quantities. Once exhausted, patterns are permanently retired to the archive.
          </p>
        </div>

        {drops.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-black/15 p-8 bg-[#F9F9F9]">
            <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block mb-2">
              ARCHIVE RELEASE
            </span>
            <h3 className="font-sans font-black text-lg uppercase tracking-tight text-black">
              NO CAPSULE DROPS CURRENTLY ACTIVE
            </h3>
            <p className="text-xs font-mono text-black/50 mt-1 max-w-sm mx-auto">
              New seasonal chapters will be published via the Atelier Studio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {drops.map((drop) => (
              <div
                key={drop.id}
                className="group relative flex flex-col bg-[#F9F9F9] overflow-hidden"
              >
                {/* Cover Image */}
                <div className="relative w-full aspect-[16/10] bg-black overflow-hidden">
                  <Image
                    src={drop.heroImage || ""}
                    alt={drop.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-khy-wide px-3 py-1.5 ${
                        drop.status === "Active"
                          ? "bg-white text-black"
                          : "bg-black text-white"
                      }`}
                    >
                      {drop.status === "Active" ? "ACTIVE NOW" : "UPCOMING"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-bold tracking-khy-ultra uppercase text-black/50 block mb-1">
                      {drop.subtitle || `DROP 00${drop.dropNumber}`}
                    </span>
                    <h3 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-tight text-black mb-2 leading-snug text-balance">
                      {drop.title}
                    </h3>
                    <p className="text-xs text-black/60 leading-relaxed mb-6">
                      {drop.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-black/70 font-mono">
                      <Clock className="w-3.5 h-3.5 text-black" />
                      <span>{drop.releaseDate}</span>
                    </div>

                    <Link
                      href={`/collections/${drop.id}`}
                      className="inline-flex items-center gap-2 text-xs font-bold tracking-khy-wide uppercase text-black hover:opacity-70 transition-opacity"
                    >
                      <span>{drop.status === "Active" ? "SHOP CAPSULE" : "VIEW LOOKBOOK"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
