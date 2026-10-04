import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { submitAnswers, getQuestionById, type SubmitItem } from "@/lib/query";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { answers } = await req.json();
    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }
    const items: SubmitItem[] = answers.map((a: any) => ({
      question_id: Number(a.question_id),
      user_answer: String(a.user_answer ?? ""),
    }));
    const results = submitAnswers(user.sub, items);
    // 补充每道题的正确答案展示文本
    const enriched = results.map((r) => {
      const q = getQuestionById(r.question_id);
      let display = r.correct_answer;
      if (q?.type === "choice" && q.options) {
        display = `${String.fromCharCode(65 + Number(r.correct_answer))}. ${q.options[Number(r.correct_answer)]}`;
      } else if (q?.type === "judge") {
        display = r.correct_answer === "true" ? "正确" : "错误";
      }
      return { ...r, correct_answer_display: display };
    });
    const correct = enriched.filter((r) => r.is_correct).length;
    return NextResponse.json({
      results: enriched,
      total: answers.length,
      correct,
      accuracy: answers.length ? Math.round((correct / answers.length) * 100) : 0,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "提交失败" }, { status: 500 });
  }
}
