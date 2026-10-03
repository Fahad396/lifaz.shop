import { NextRequest, NextResponse } from "next/server";
import { saveSubscriber } from "@/lib/server-db";
import { sanitizeString } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`newsletter:${ip}`, 6, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please wait." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const email = sanitizeString(body.email);

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address required." },
        { status: 400 }
      );
    }

    const saved = saveSubscriber(email);
    if (!saved) {
      return NextResponse.json({
        success: true,
        message: "Email already registered in VIP registry.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined LIFAZ VIP Registry.",
    });
  } catch {
    return NextResponse.json(
      { error: "Subscription failed." },
      { status: 400 }
    );
  }
}
