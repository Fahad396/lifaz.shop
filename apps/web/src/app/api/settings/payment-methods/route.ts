import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentMethods,
  getPaymentMethodById,
  savePaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod,
} from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { sanitizeObject } from "@/lib/validation";
import { PaymentMethodConfig } from "@/lib/types";

export async function GET(req: NextRequest) {
  const isAdmin = isAuthorizedAdminRequest(req.headers);
  const paymentMethods = getPaymentMethods(isAdmin);
  return NextResponse.json({ paymentMethods });
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
    const sanitized = sanitizeObject(body) as Partial<PaymentMethodConfig>;

    if (!sanitized.name || typeof sanitized.name !== "string") {
      return NextResponse.json(
        { error: "Payment method name is required." },
        { status: 400 }
      );
    }

    const id = sanitized.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMethod: PaymentMethodConfig = {
      id,
      name: sanitized.name.trim(),
      type: sanitized.type || "mfs",
      provider: sanitized.provider || "custom",
      accountNumber: sanitized.accountNumber?.trim() || undefined,
      accountType: sanitized.accountType || undefined,
      instructions: sanitized.instructions?.trim() || "",
      requiresTrxId: Boolean(sanitized.requiresTrxId),
      isActive: sanitized.isActive !== undefined ? Boolean(sanitized.isActive) : true,
      displayOrder: Number(sanitized.displayOrder) || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePaymentMethod(newMethod);

    return NextResponse.json({
      success: true,
      paymentMethod: newMethod,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create payment method." },
      { status: 400 }
    );
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
    const sanitized = sanitizeObject(body) as Partial<PaymentMethodConfig>;

    if (!sanitized.id) {
      return NextResponse.json(
        { error: "Payment method ID is required for update." },
        { status: 400 }
      );
    }

    const updated = updatePaymentMethod(sanitized.id, {
      name: sanitized.name?.trim(),
      type: sanitized.type,
      provider: sanitized.provider,
      accountNumber: sanitized.accountNumber?.trim() || undefined,
      accountType: sanitized.accountType,
      instructions: sanitized.instructions?.trim(),
      requiresTrxId: sanitized.requiresTrxId !== undefined ? Boolean(sanitized.requiresTrxId) : undefined,
      isActive: sanitized.isActive !== undefined ? Boolean(sanitized.isActive) : undefined,
      displayOrder: sanitized.displayOrder !== undefined ? Number(sanitized.displayOrder) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Payment method not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentMethod: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update payment method." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Payment method ID is required." },
        { status: 400 }
      );
    }

    if (action === "toggle") {
      const updated = togglePaymentMethodStatus(id);
      if (!updated) {
        return NextResponse.json({ error: "Method not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, paymentMethod: updated });
    }

    // Default update
    const updated = updatePaymentMethod(id, body.updates || {});
    return NextResponse.json({ success: true, paymentMethod: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to patch payment method." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Payment method ID is required in query params (?id=...)." },
      { status: 400 }
    );
  }

  const deleted = deletePaymentMethod(id);
  if (deleted) {
    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully.",
    });
  }

  return NextResponse.json(
    { error: "Payment method not found." },
    { status: 404 }
  );
}
