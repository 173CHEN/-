import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWrongQuestions } from "@/lib/query";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const questions = getWrongQuestions(user.sub);
  // 返回错题时不暴露答案，做题时再判
  const safe = questions.map((q) => ({
    id: q.id,
    category: q.category,
    type: q.type,
    difficulty: q.difficulty,
    content: q.content,
    options: q.options,
    image_url: q.image_url,
  }));
  return NextResponse.json({ questions: safe });
}
