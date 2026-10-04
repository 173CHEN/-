import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  try {
    const { students } = await req.json();
    if (!Array.isArray(students)) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }
    const insert = db.prepare(
      "INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?,?, 'student')"
    );
    let added = 0;
    let skipped = 0;
    const tx = db.transaction((list) => {
      for (const s of list) {
        if (!s.username || !s.password) {
          skipped++;
          continue;
        }
        const hash = bcrypt.hashSync(s.password, 10);
        const info = insert.run(s.username, hash);
        if (info.changes > 0) added++;
        else skipped++;
      }
    });
    tx(students);
    return NextResponse.json({ added, skipped });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "添加失败" }, { status: 500 });
  }
}
