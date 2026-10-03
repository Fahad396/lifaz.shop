import { NextRequest, NextResponse } from "next/server";
import { getUserByEmailOrPhone, saveUser } from "@/lib/server-db";
import { sanitizeString } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { User } from "@/lib/types";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`auth-register:${ip}`, 10, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const name = sanitizeString(body.name);
    const email = sanitizeString(body.email).toLowerCase();
    const phone = sanitizeString(body.phone);
    const password = body.password;
    const division = sanitizeString(body.division) || "Dhaka";
    const area = sanitizeString(body.area) || "";
    const address = sanitizeString(body.address) || "";

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Name, email, phone number, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const existingUser = getUserByEmailOrPhone(email) || getUserByEmailOrPhone(phone);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email or phone number already exists." },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      email,
      phone,
      password, // Base client-side or hashed pass
      division,
      area,
      address,
      vipTier: "Member",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveUser(newUser);

    // Return safe user object without password
    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Welcome to LIFAZ VIP.",
      user: safeUser,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}
