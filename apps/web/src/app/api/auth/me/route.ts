import { NextRequest, NextResponse } from "next/server";
import { getUserById, getUserOrders } from "@/lib/server-db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { password: _, ...safeUser } = user;
  const orders = getUserOrders(user.id);

  return NextResponse.json({
    user: safeUser,
    orders,
  });
}
