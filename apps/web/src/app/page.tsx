import React from "react";
import { getDatabase } from "@/lib/server-db";
import { Hero } from "@/components/home/Hero";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { MosaicSection } from "@/components/home/MosaicSection";
import { DropsShowcase } from "@/components/home/DropsShowcase";
import { Newsletter } from "@/components/home/Newsletter";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDatabase();
  const { products, drops, hero, mosaic } = db;

  return (
    <div className="w-full flex flex-col">
      {/* 1. Runway Campaign Hero */}
      <Hero settings={hero} />

      {/* 2. Featured Pieces Carousel */}
      <FeaturedCarousel
        products={products}
        title="Ready-To-Wear // Latest Pieces"
        subtitle="Direct from our Dhaka atelier floor. Insured nationwide courier delivery."
      />

      {/* 3. Architectural Form Mosaic (Sculpted Minimalism) */}
      <MosaicSection settings={mosaic} />

      {/* 4. Capsule Drops Engine */}
      <DropsShowcase drops={drops} />

      {/* 5. VIP Registry & Newsletter */}
      <Newsletter />
    </div>
  );
}
