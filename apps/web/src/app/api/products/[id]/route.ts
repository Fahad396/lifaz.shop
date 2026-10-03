import { NextRequest, NextResponse } from "next/server";
import { getProductById, saveProduct, deleteProduct } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { validateProductInput } from "@/lib/validation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: Props) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const existing = getProductById(id);

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const validated = validateProductInput(body);

    const updated = {
      ...existing,
      ...validated,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    saveProduct(updated as any);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const success = deleteProduct(id);

  if (success) {
    return NextResponse.json({ success: true, message: "Product deleted." });
  }

  return NextResponse.json({ error: "Product not found" }, { status: 404 });
}
