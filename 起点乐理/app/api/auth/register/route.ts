import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password, role } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }
    if (username.length < 2 || password.length < 4) {
      return NextResponse.json({ error: "用户名至少2位，密码至少4位" }, { status: 400 });
    }
    const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (exists) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }
    const hash = bcrypt.hashSync(password, 10);
    const userRole = role === "teacher" ? "teacher" : "student";
    const info = db
      .prepare("INSERT INTO users (username, password_hash, role) VALUES (?,?,?)")
      .run(username, hash, userRole);
    const token = await signToken({
      sub: Number(info.lastInsertRowid),
      username,
      role: userRole as "student" | "teacher",
    });
    await setAuthCookie(token);
    return NextResponse.json({ id: info.lastInsertRowid, username, role: userRole });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "注册失败" }, { status: 500 });
  }
}
