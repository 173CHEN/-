import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserStats } from "@/lib/query";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const stats = getUserStats(user.sub);
  return NextResponse.json(stats);
}
