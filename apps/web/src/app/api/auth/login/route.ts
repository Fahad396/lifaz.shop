import { NextRequest, NextResponse } from "next/server";
import { getUserByEmailOrPhone } from "@/lib/server-db";
import { sanitizeString } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`auth-login:${ip}`, 15, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const identifier = sanitizeString(body.identifier || body.email || body.phone);
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email or phone number and password are required." },
        { status: 400 }
      );
    }

    const user = getUserByEmailOrPhone(identifier);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. No account found with these details." },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials. Incorrect password." },
        { status: 401 }
      );
    }

    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: "Successfully signed in to LIFAZ VIP.",
      user: safeUser,
    });
  } catch {
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
