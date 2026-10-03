import { NextRequest, NextResponse } from "next/server";
import { getHeroSettings, saveHeroSettings } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { sanitizeObject } from "@/lib/validation";
import { HeroSettings } from "@/lib/types";

export async function GET() {
  const hero = getHeroSettings();
  return NextResponse.json({ hero });
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
    const clean = sanitizeObject(body) as HeroSettings;
    saveHeroSettings(clean);
    return NextResponse.json({ success: true, hero: clean });
  } catch {
    return NextResponse.json(
      { error: "Failed to update hero studio settings." },
      { status: 400 }
    );
  }
}
