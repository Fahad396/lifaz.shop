import { NextRequest, NextResponse } from "next/server";
import { getOrders, saveOrder } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { validateOrderInput } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { Order } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  const orders = getOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`checkout:${ip}`, 10, 10 * 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Checkout rate limit exceeded. Please wait a few minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validated = validateOrderInput(body);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `LIFAZ-BD-${randomSuffix}`;

    const subtotal = Number(validated.subtotal) || 0;
    const shippingCost = Number(validated.shippingCost) || 0;
    const total = Number(validated.total) || (subtotal + shippingCost);

    const paymentMethodName =
      body.paymentMethod ||
      (body.paymentType === "full_cod" ? "Cash on Delivery (COD)" : "bKash Mobile Banking");
    const paymentMethodId = body.paymentMethodId || undefined;

    const isCod =
      body.paymentType === "full_cod" ||
      paymentMethodName.toLowerCase().includes("cash") ||
      paymentMethodName.toLowerCase().includes("cod");

    const paymentType =
      body.paymentType ||
      (body.advancePaid ? "advance_delivery_cod" : isCod ? "full_cod" : "full_advance");
    const advancePaid =
      body.advancePaid !== undefined
        ? Number(body.advancePaid)
        : paymentType === "advance_delivery_cod"
        ? shippingCost
        : paymentType === "full_advance"
        ? total
        : 0;
    const dueAmount =
      body.dueAmount !== undefined
        ? Number(body.dueAmount)
        : Math.max(0, total - advancePaid);

    const paymentStatus: string =
      body.paymentStatus ||
      (paymentType === "advance_delivery_cod"
        ? "Advance Delivery Fee Paid (Pending TrxID)"
        : paymentType === "full_advance"
        ? "Full Payment Paid (Pending TrxID)"
        : isCod
        ? "COD Due"
        : "Pending Verification");

    const newOrder: Order = {
      id: orderNumber,
      orderNumber,
      userId: body.userId || undefined,
      customer: validated.customer!,
      email: validated.email || "customer@lifaz.shop",
      phone: validated.phone!,
      division: validated.division || "Dhaka",
      area: validated.area || "Dhaka",
      address: validated.address!,
      items: validated.items || "Atelier Garment x1",
      lineItems: validated.lineItems || [],
      subtotal,
      shippingCost,
      total,
      paymentType,
      advancePaid,
      dueAmount,
      paymentMethod: paymentMethodName,
      paymentMethodId,
      paymentStatus,
      bkashTrxId: validated.bkashTrxId || body.paymentReference || undefined,
      paymentReference: body.paymentReference || validated.bkashTrxId || undefined,
      status: "Order Confirmed",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      createdAt: new Date().toISOString(),
    };

    saveOrder(newOrder);

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to place order." },
      { status: 400 }
    );
  }
}
