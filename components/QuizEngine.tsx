"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TYPE_LABELS, DIFFICULTY_LABELS, categoryName } from "@/lib/categories";

interface QuestionDTO {
  id: number;
  category: string;
  type: "choice" | "fill" | "judge";
  difficulty: string;
  content: string;
  options: string[] | null;
  image_url: string | null;
}

interface SubmitResult {
  question_id: number;
  is_correct: boolean;
  explanation: string;
  correct_answer: string;
  correct_answer_display: string;
}

export default function QuizEngine({
  mode,
  timeLimit,
}: {
  mode: "practice" | "wrong" | "exam";
  timeLimit?: number; // minutes, for exam
}) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SubmitResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    timeLimit ? timeLimit * 60 : null
  );

  useEffect(() => {
    let url = "/api/questions?random=1";
    if (mode === "wrong") url = "/api/wrong";
    else {
      if (category) url += `&category=${category}`;
      if (mode === "exam") url += "&limit=20";
      else url += "&limit=10";
    }
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions || []);
        setLoading(false);
      })
      .catch(() => {
        setError("加载题目失败");
        setLoading(false);
      });
  }, [mode, category]);

  // 倒计时
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const correctCount = useMemo(
    () => (results ? results.filter((r) => r.is_correct).length : 0),
    [results]
  );

  function setAnswer(id: number, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload = Object.entries(answers).map(([question_id, user_answer]) => ({
      question_id: Number(question_id),
      user_answer,
    }));
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "提交失败");
      return;
    }
    setResults(data.results);
    setSecondsLeft(null);
  }

  if (loading) return <div className="py-10 text-center text-gray-500">加载题目中...</div>;
  if (error) return <div className="py-10 text-center text-red-500">{error}</div>;
  if (questions.length === 0)
    return (
      <div className="py-10 text-center text-gray-500">
        {mode === "wrong" ? "暂无错题，继续加油！" : "暂无可用题目。"}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          {mode === "exam"
            ? "📝 模拟考试"
            : mode === "wrong"
            ? "❌ 错题练习"
            : `📚 ${category ? categoryName(category as any) : "综合练习"}`}
        </h1>
        {secondsLeft !== null && (
          <div className="rounded-lg bg-brand-50 px-4 py-2 font-mono text-lg font-bold text-brand-700">
            ⏱ {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      {results && (
        <div className="card flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
          <div>
            <div className="text-sm text-gray-500">本次成绩</div>
            <div className="text-3xl font-bold text-brand-700">
              {correctCount} / {results.length}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">正确率</div>
            <div className="text-3xl font-bold text-brand-700">
              {results.length ? Math.round((correctCount / results.length) * 100) : 0}%
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const result = results?.find((r) => r.question_id === q.id);
          return (
            <div key={q.id} className="card">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-brand-100 px-2 py-0.5 text-brand-700">
                  {categoryName(q.category as any)}
                </span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                  {TYPE_LABELS[q.type]}
                </span>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700">
                  {DIFFICULTY_LABELS[q.difficulty]}
                </span>
                {result && (
                  <span
                    className={`rounded px-2 py-0.5 ${
                      result.is_correct
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {result.is_correct ? "✓ 正确" : "✗ 错误"}
                  </span>
                )}
              </div>
              <p className="text-gray-800">
                <span className="mr-1 font-semibold">{idx + 1}.</span>
                {q.content}
              </p>
              {q.image_url && (
                <img src={q.image_url} alt="题目配图" className="my-3 max-h-60 rounded" />
              )}
              <AnswerInput
                q={q}
                value={answers[q.id] || ""}
                onChange={(v) => setAnswer(q.id, v)}
                disabled={!!results}
                result={result}
              />
              {result && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                  <div className="font-medium text-gray-700">
                    正确答案：{result.correct_answer_display}
                  </div>
                  <div className="mt-1 text-gray-600">解析：{result.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!results && (
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
          {submitting ? "提交中..." : mode === "exam" ? "交卷" : "提交并查看解析"}
        </button>
      )}
      {results && (
        <button
          onClick={() => {
            setResults(null);
            setAnswers({});
            setSecondsLeft(timeLimit ? timeLimit * 60 : null);
            // 重新取题
            setLoading(true);
            let url = "/api/questions?random=1";
            if (mode === "wrong") url = "/api/wrong";
            else {
              if (category) url += `&category=${category}`;
              if (mode === "exam") url += "&limit=20";
              else url += "&limit=10";
            }
            fetch(url)
              .then((r) => r.json())
              .then((d) => {
                setQuestions(d.questions || []);
                setLoading(false);
              });
          }}
          className="btn-secondary w-full"
        >
          再来一组
        </button>
      )}
    </div>
  );
}

function AnswerInput({
  q,
  value,
  onChange,
  disabled,
  result,
}: {
  q: QuestionDTO;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  result?: SubmitResult;
}) {
  if (q.type === "choice" && q.options) {
    return (
      <div className="mt-3 space-y-2">
        {q.options.map((opt, i) => {
          const selected = value === String(i);
          const isCorrect = result && result.correct_answer === String(i);
          const isWrongSelected = result && selected && !result.is_correct;
          return (
            <label
              key={i}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition ${
                disabled
                  ? isCorrect
                    ? "border-green-400 bg-green-50"
                    : isWrongSelected
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white"
                  : selected
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 hover:border-brand-300"
              } ${disabled ? "cursor-default" : ""}`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(String(i))}
                className="h-4 w-4 text-brand-600"
              />
              <span className="font-medium">{String.fromCharCode(65 + i)}.</span>
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (q.type === "judge") {
    return (
      <div className="mt-3 flex gap-3">
        {[
          { v: "true", label: "✓ 正确" },
          { v: "false", label: "✗ 错误" },
        ].map((o) => {
          const selected = value === o.v;
          const isCorrect = result && result.correct_answer === o.v;
          const isWrongSelected = result && selected && !result.is_correct;
          return (
            <button
              key={o.v}
              type="button"
              disabled={disabled}
              onClick={() => onChange(o.v)}
              className={`rounded-lg border px-5 py-2 text-sm font-medium transition ${
                disabled
                  ? isCorrect
                    ? "border-green-400 bg-green-50 text-green-700"
                    : isWrongSelected
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-gray-200"
                  : selected
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 hover:border-brand-300"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }
  // fill
  return (
    <input
      className="input mt-3"
      placeholder="请输入答案"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
