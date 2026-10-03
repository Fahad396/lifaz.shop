import { NextRequest, NextResponse } from "next/server";
import { getDatabase, getDatabaseStats, saveDatabase } from "@/lib/server-db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "backup") {
    const db = getDatabase();
    return new NextResponse(JSON.stringify(db, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lifaz-database-backup-${Date.now()}.json"`,
      },
    });
  }

  const stats = getDatabaseStats();
  const db = getDatabase();

  return NextResponse.json({
    stats,
    database: db,
  });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req.headers)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin passkey required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table") as
      | "products"
      | "drops"
      | "orders"
      | "inquiries"
      | "subscribers";
    const id = searchParams.get("id");

    if (!table || !id) {
      return NextResponse.json(
        { error: "Table and ID parameters required." },
        { status: 400 }
      );
    }

    const db = getDatabase();
    if (table in db && Array.isArray((db as any)[table])) {
      (db as any)[table] = (db as any)[table].filter(
        (item: any) => item.id !== id && item.ticketNumber !== id
      );
      saveDatabase(db);
      return NextResponse.json({
        success: true,
        message: `Deleted record ${id} from ${table}`,
      });
    }

    return NextResponse.json({ error: "Invalid table." }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete record." },
      { status: 400 }
    );
  }
}
