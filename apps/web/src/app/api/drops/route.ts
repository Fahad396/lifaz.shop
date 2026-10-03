import { NextRequest, NextResponse } from "next/server";
import { getDrops, saveDrop } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { sanitizeObject } from "@/lib/validation";
import { Drop } from "@/lib/types";

export async function GET() {
  const drops = getDrops();
  return NextResponse.json(
    { drops },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
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
    const clean = sanitizeObject(body) as Partial<Drop>;

    if (!clean.title) {
      return NextResponse.json(
        { error: "Drop title is required." },
        { status: 400 }
      );
    }

    const dropNumber = Number(clean.dropNumber) || getDrops().length + 1;
    const newDrop: Drop = {
      id: clean.id || `drop-${String(dropNumber).padStart(3, "0")}`,
      dropNumber,
      title: clean.title,
      name: clean.name || clean.title.toUpperCase(),
      subtitle: clean.subtitle || "",
      description: clean.description || "",
      heroImage:
        clean.heroImage ||
        "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1600&auto=format&fit=crop",
      lookbookImages: clean.lookbookImages || [],
      status: clean.status || "Upcoming",
      releaseDate: clean.releaseDate || "SOON",
    };

    saveDrop(newDrop);

    return NextResponse.json({ success: true, drop: newDrop });
  } catch {
    return NextResponse.json(
      { error: "Failed to create drop." },
      { status: 400 }
    );
  }
}
