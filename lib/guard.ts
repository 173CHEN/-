import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// 简单的页面级鉴权辅助：在需要登录的页面服务端组件中调用
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

export async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") return null;
  return user;
}
