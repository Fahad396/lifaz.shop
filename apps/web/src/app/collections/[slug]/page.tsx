import React from "react";
import { notFound } from "next/navigation";
import { getDatabase, getProducts, getDrops, getCategories } from "@/lib/server-db";
import { CollectionClient } from "@/components/plp/CollectionClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const db = getDatabase();
  const allProducts = db.products;
  const drops = db.drops;
  const categories = db.categories;

  let title = "Complete Archive";
  let description =
    "All ready-to-wear pieces, sculpted outerwear, and archival garments crafted in our Dhaka atelier.";
  let currentDrop = undefined;
  let filteredProducts = allProducts;

  if (slug === "all") {
    // Show all
  } else if (slug.startsWith("drop-") || slug.startsWith("00")) {
    const drop = drops.find(
      (d) =>
        d.id === slug ||
        d.id === `drop-${slug}` ||
        `00${d.dropNumber}` === slug ||
        d.dropNumber.toString() === slug
    );
    if (drop) {
      currentDrop = drop;
      title = drop.title;
      description = drop.description;
      filteredProducts = allProducts.filter(
        (p) =>
          p.drop?.toLowerCase().includes(drop.title.toLowerCase()) ||
          p.dropNumber === drop.dropNumber
      );
    }
  } else {
    // Category match
    const catMatch = categories.find(
      (c) => c.toLowerCase() === slug.toLowerCase()
    );
    if (catMatch) {
      title = `${catMatch} Collection`;
      description = `Curated selection of ${catMatch.toLowerCase()} engineered with bespoke proportions and premium textiles.`;
      filteredProducts = allProducts.filter(
        (p) => p.category?.toLowerCase() === catMatch.toLowerCase()
      );
    } else {
      title = `${slug.replace("-", " ").toUpperCase()}`;
      filteredProducts = allProducts.filter(
        (p) =>
          p.category?.toLowerCase() === slug.toLowerCase() ||
          p.title?.toLowerCase().includes(slug.toLowerCase())
      );
    }
  }

  return (
    <CollectionClient
      initialProducts={filteredProducts}
      categories={categories}
      currentDrop={currentDrop}
      title={title}
      description={description}
    />
  );
}
