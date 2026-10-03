import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  inspectPayloadForRawCardData,
  recordIdempotentTransaction,
} from "@/lib/payment-firewall";
import { getOrders, updateOrder } from "@/lib/server-db";

/**
 * LIFAZ Atelier — Secure Payment Webhook Receiver
 *
 * PCI-DSS & HMAC Verification:
 * 1. Reads raw body stream for exact signature verification.
 * 2. Enforces timing-safe HMAC-SHA256 signature verification.
 * 3. Deep-scans payload with Zero-PAN firewall.
 * 4. Checks idempotency locks to eliminate duplicate captures.
 * 5. Updates order status securely in the database.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Extract raw byte body (Crucial for cryptographic signature verification)
    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get("x-webhook-signature") ||
      req.headers.get("stripe-signature") ||
      req.headers.get("x-bkash-signature");

    const webhookSecret =
      process.env.PAYMENT_WEBHOOK_SECRET ||
      process.env.ADMIN_SECRET_KEY ||
      "lifaz_atelier_webhook_secret_2026";

    // 2. Cryptographic HMAC Verification
    const verification = verifyWebhookSignature(rawBody, signatureHeader, webhookSecret);
    if (!verification.isValid) {
      console.warn(`[Payment Firewall] Webhook rejected: ${verification.reason}`);
      return NextResponse.json(
        { error: "Unauthorized: Invalid cryptographic signature", reason: verification.reason },
        { status: 401 }
      );
    }

    // 3. Parse JSON & Run PCI-DSS Zero-PAN Scanner
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Deep inspect payload to guarantee no raw cardholder data was transmitted
    inspectPayloadForRawCardData(payload);

    const {
      eventType,
      orderId,
      orderNumber,
      transactionId,
      paymentStatus,
      paymentMethod,
    } = payload as {
      eventType?: string;
      orderId?: string;
      orderNumber?: string;
      transactionId?: string;
      paymentStatus?: string;
      paymentMethod?: string;
    };

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: "Missing required order identifier (orderId or orderNumber)" },
        { status: 400 }
      );
    }

    // 4. Idempotency Check
    const effectiveTrxId = (transactionId || `${orderId}_${paymentStatus}`) as string;
    const idempotency = recordIdempotentTransaction(effectiveTrxId, paymentStatus || "SUCCESS");
    if (idempotency.isDuplicate) {
      console.info(`[Payment Firewall] Duplicate webhook event ignored (Trx: ${effectiveTrxId})`);
      return NextResponse.json({
        success: true,
        message: "Duplicate event acknowledged (idempotent)",
        previousStatus: idempotency.previousStatus,
      });
    }

    // 5. Update Order in Database
    const orders = await getOrders();
    const targetOrder = orders.find(
      (o) => o.id === orderId || o.orderNumber === orderNumber
    );

    if (!targetOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const newPaymentStatus =
      paymentStatus === "COMPLETED" || paymentStatus === "PAID"
        ? "Paid"
        : paymentStatus === "FAILED"
        ? "Failed"
        : "Pending";

    const updated = await updateOrder(targetOrder.id, {
      paymentStatus: newPaymentStatus,
      trxId: transactionId || targetOrder.trxId,
      paymentMethod: paymentMethod || targetOrder.paymentMethod,
      orderStatus: newPaymentStatus === "Paid" ? "Processing" : targetOrder.orderStatus,
    });

    return NextResponse.json({
      success: true,
      message: "Payment cryptographically verified and recorded",
      orderNumber: updated?.orderNumber,
      paymentStatus: updated?.paymentStatus,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[Payment Firewall Error]:", message);
    return NextResponse.json(
      { error: "Security Exception", details: message },
      { status: 400 }
    );
  }
}
