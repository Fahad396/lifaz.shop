import { NextRequest, NextResponse } from "next/server";
import { getMosaicSettings, saveMosaicSettings } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { sanitizeObject } from "@/lib/validation";
import { MosaicSettings } from "@/lib/types";

export async function GET() {
  const mosaic = getMosaicSettings();
  return NextResponse.json({ mosaic });
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
    const clean = sanitizeObject(body) as MosaicSettings;
    saveMosaicSettings(clean);
    return NextResponse.json({ success: true, mosaic: clean });
  } catch {
    return NextResponse.json(
      { error: "Failed to update Sculpted Minimalism settings." },
      { status: 400 }
    );
  }
}
