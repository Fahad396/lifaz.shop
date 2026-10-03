import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategory, deleteCategory } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

export async function GET() {
  const categories = getCategories();
  return NextResponse.json({ categories });
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
    const { name } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    const success = saveCategory(name);
    if (!success) {
      return NextResponse.json({ error: "Category already exists or is invalid" }, { status: 400 });
    }
    return NextResponse.json({ success, categories: getCategories() });
  } catch {
    return NextResponse.json({ error: "Failed to add category" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { oldName, newName } = body;
    if (!oldName || !newName || typeof oldName !== "string" || typeof newName !== "string") {
      return NextResponse.json({ error: "Both oldName and newName are required" }, { status: 400 });
    }
    const { updateCategory } = await import("@/lib/server-db");
    const success = updateCategory(oldName, newName);
    if (!success) {
      return NextResponse.json({ error: "Category not found or could not be updated" }, { status: 400 });
    }
    return NextResponse.json({ success, categories: getCategories() });
  } catch {
    return NextResponse.json({ error: "Failed to update category" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    const success = deleteCategory(name);
    return NextResponse.json({ success, categories: getCategories() });
  } catch {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 400 });
  }
}
