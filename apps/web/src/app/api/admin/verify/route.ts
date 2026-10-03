import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPasskey } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`admin-auth:${ip}`, 5, 15 * 60);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Too many authorization attempts. Rate limited for ${rate.resetSeconds}s.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { passkey } = body;

    if (!passkey) {
      return NextResponse.json(
        { error: "Passkey is required" },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPasskey(passkey);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid master passkey authorization." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Atelier Studio authorization granted.",
      token: passkey,
    });
  } catch {
    return NextResponse.json(
      { error: "Malformed verification request." },
      { status: 400 }
    );
  }
}
