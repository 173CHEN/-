import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as any;
    if (!user) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }
    const token = await signToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    await setAuthCookie(token);
    return NextResponse.json({ id: user.id, username: user.username, role: user.role });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "登录失败" }, { status: 500 });
  }
}
