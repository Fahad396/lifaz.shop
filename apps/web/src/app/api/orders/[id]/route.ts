import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: Props) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { status, paymentStatus, trxId, bkashTrxId } = body;

    if (!status && !paymentStatus && trxId === undefined && bkashTrxId === undefined) {
      return NextResponse.json(
        { error: "At least one update field (status, paymentStatus, trxId) is required" },
        { status: 400 }
      );
    }

    const updated = updateOrderStatus(id, status, paymentStatus, trxId || bkashTrxId);
    if (updated) {
      return NextResponse.json({
        success: true,
        message: "Order updated successfully",
      });
    }
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}
