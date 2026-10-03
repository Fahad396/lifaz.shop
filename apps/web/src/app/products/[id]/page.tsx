import React from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/server-db";
import { PDPClient } from "@/components/pdp/PDPClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <PDPClient product={product} />;
}
