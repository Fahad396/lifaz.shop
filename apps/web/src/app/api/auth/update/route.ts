import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile, getUserById } from "@/lib/server-db";
import { sanitizeString } from "@/lib/validation";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, phone, division, area, address } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const existing = getUserById(userId);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: any = {};
    if (name) updates.name = sanitizeString(name);
    if (phone) updates.phone = sanitizeString(phone);
    if (division) updates.division = sanitizeString(division);
    if (area !== undefined) updates.area = sanitizeString(area);
    if (address !== undefined) updates.address = sanitizeString(address);

    const updated = updateUserProfile(userId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    const { password: _, ...safeUser } = updated;

    return NextResponse.json({
      success: true,
      message: "Delivery details updated successfully.",
      user: safeUser,
    });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
