import { NextRequest, NextResponse } from "next/server";
import { getQuestions } from "@/lib/query";
import type { Category, QuestionType, Difficulty } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") as Category) || undefined;
  const type = (searchParams.get("type") as QuestionType) || undefined;
  const difficulty = (searchParams.get("difficulty") as Difficulty) || undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
  const random = searchParams.get("random") === "1";

  const questions = getQuestions({ category, type, difficulty, limit, random });
  // 返回给客户端时去掉正确答案，防止作弊
  const safe = questions.map((q) => ({
    id: q.id,
    category: q.category,
    type: q.type,
    difficulty: q.difficulty,
    content: q.content,
    options: q.options,
    image_url: q.image_url,
  }));
  return NextResponse.json({ questions: safe, total: safe.length });
}
