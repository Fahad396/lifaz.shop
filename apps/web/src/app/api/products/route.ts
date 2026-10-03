import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProduct } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { validateProductInput } from "@/lib/validation";
import { Product } from "@/lib/types";

export async function GET() {
  const products = getProducts();
  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = validateProductInput(body);

    const newProduct: Product = {
      id: validated.id || `lifaz-${Date.now()}`,
      title: validated.title!,
      slug:
        validated.slug ||
        validated.title!.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: Number(validated.price) || 0,
      compareAtPrice: validated.compareAtPrice
        ? Number(validated.compareAtPrice)
        : undefined,
      drop: validated.drop || "Drop 001",
      dropNumber: Number(validated.dropNumber) || 1,
      category: validated.category || "Outerwear",
      color: validated.color || "Black",
      colorHex: validated.colorHex || "#111111",
      description: validated.description || "",
      details: Array.isArray(validated.details) ? validated.details : [],
      fabrication: Array.isArray(validated.fabrication)
        ? validated.fabrication
        : [],
      images: Array.isArray(validated.images) ? validated.images : [],
      sizeChartImage: validated.sizeChartImage,
      sizeChartNotes: validated.sizeChartNotes,
      measurements: Array.isArray(validated.measurements)
        ? validated.measurements
        : undefined,
      variants: Array.isArray(validated.variants) && validated.variants.length > 0
        ? validated.variants
        : [
            { id: "v-xs", size: "XS", color: validated.color || "Black", sku: `SKU-${Date.now()}-XS`, inventory: 5, inStock: true },
            { id: "v-s", size: "S", color: validated.color || "Black", sku: `SKU-${Date.now()}-S`, inventory: 10, inStock: true },
            { id: "v-m", size: "M", color: validated.color || "Black", sku: `SKU-${Date.now()}-M`, inventory: 15, inStock: true },
            { id: "v-l", size: "L", color: validated.color || "Black", sku: `SKU-${Date.now()}-L`, inventory: 10, inStock: true },
            { id: "v-xl", size: "XL", color: validated.color || "Black", sku: `SKU-${Date.now()}-XL`, inventory: 5, inStock: true },
          ],
      rating: 5.0,
      reviewCount: 0,
      featured: Boolean(validated.featured),
      badge: validated.badge,
    };

    saveProduct(newProduct);

    return NextResponse.json({
      success: true,
      product: newProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid product mutation." },
      { status: 400 }
    );
  }
}
