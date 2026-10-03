import { NextRequest, NextResponse } from "next/server";
import { saveInquiry } from "@/lib/server-db";
import { sanitizeObject, sanitizeString } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { Inquiry } from "@/lib/types";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`contact:${ip}`, 6, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const clean = sanitizeObject(body) as Partial<Inquiry>;

    if (!clean.name || !clean.email || !clean.message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const ticketNumber = `CONCIERGE-${Math.floor(100000 + Math.random() * 900000)}`;

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      ticketNumber,
      name: clean.name,
      email: clean.email,
      phone: clean.phone,
      subject: clean.subject || "General Concierge",
      message: clean.message,
      orderNumber: clean.orderNumber,
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    saveInquiry(newInquiry);

    return NextResponse.json({
      success: true,
      ticketNumber,
      inquiry: newInquiry,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process concierge inquiry." },
      { status: 400 }
    );
  }
}
