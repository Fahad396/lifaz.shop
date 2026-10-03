import { NextRequest, NextResponse } from "next/server";
import { getDropById, saveDrop, deleteDrop } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { sanitizeObject } from "@/lib/validation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const drop = getDropById(id);

  if (!drop) {
    return NextResponse.json({ error: "Drop not found" }, { status: 404 });
  }

  return NextResponse.json({ drop });
}

export async function PUT(req: NextRequest, { params }: Props) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const existing = getDropById(id);

  if (!existing) {
    return NextResponse.json({ error: "Drop not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const clean = sanitizeObject(body);

    const updated = {
      ...existing,
      ...clean,
      id: existing.id,
    };

    saveDrop(updated as any);
    return NextResponse.json({ success: true, drop: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update drop." },
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
  const success = deleteDrop(id);

  if (success) {
    return NextResponse.json({ success: true, message: "Drop deleted." });
  }

  return NextResponse.json({ error: "Drop not found" }, { status: 404 });
}
