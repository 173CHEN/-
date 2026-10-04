import db from "./db";
import type { Question, Category, QuestionType, Difficulty } from "./types";

function rowToQuestion(row: any): Question {
  return {
    id: row.id,
    category: row.category,
    type: row.type,
    difficulty: row.difficulty,
    content: row.content,
    options: row.options ? JSON.parse(row.options) : null,
    answer: row.answer,
    explanation: row.explanation,
    image_url: row.image_url,
  };
}

export function getQuestions(params: {
  category?: Category;
  type?: QuestionType;
  difficulty?: Difficulty;
  limit?: number;
  random?: boolean;
}): Question[] {
  const where: string[] = [];
  const args: any[] = [];
  if (params.category) {
    where.push("category = ?");
    args.push(params.category);
  }
  if (params.type) {
    where.push("type = ?");
    args.push(params.type);
  }
  if (params.difficulty) {
    where.push("difficulty = ?");
    args.push(params.difficulty);
  }
  let sql = "SELECT * FROM questions";
  if (where.length) sql += " WHERE " + where.join(" AND ");
  if (params.random) sql += " ORDER BY RANDOM()";
  if (params.limit) sql += " LIMIT ?";
  if (params.limit) args.push(params.limit);
  const rows = db.prepare(sql).all(...args);
  return rows.map(rowToQuestion);
}

export function getQuestionById(id: number): Question | undefined {
  const row = db.prepare("SELECT * FROM questions WHERE id = ?").get(id);
  return row ? rowToQuestion(row) : undefined;
}

export function countQuestions(): number {
  return (db.prepare("SELECT COUNT(*) AS c FROM questions").get() as any).c;
}

// 判题：返回是否正确（填空题做宽松匹配：去空格、忽略大小写）
export function checkAnswer(q: Question, userAnswer: string): boolean {
  if (!userAnswer) return false;
  if (q.type === "fill") {
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");
    return normalize(userAnswer) === normalize(q.answer);
  }
  if (q.type === "judge") {
    const ua = userAnswer.toLowerCase().trim();
    return ua === q.answer.toLowerCase();
  }
  // choice
  return userAnswer.trim() === q.answer;
}

export interface SubmitItem {
  question_id: number;
  user_answer: string;
}

// 提交一次答题：写入 practice_records，并维护 wrong_questions
export function submitAnswers(userId: number, items: SubmitItem[]) {
  const results: { question_id: number; is_correct: boolean; explanation: string; correct_answer: string }[] = [];
  const insertRecord = db.prepare(
    "INSERT INTO practice_records (user_id, question_id, user_answer, is_correct) VALUES (?,?,?,?)"
  );
  const upsertWrong = db.prepare(`
    INSERT INTO wrong_questions (user_id, question_id, times_wrong, last_attempt, resolved)
    VALUES (?,?,1,datetime('now','localtime'),0)
    ON CONFLICT(user_id, question_id) DO UPDATE SET
      times_wrong = times_wrong + 1,
      last_attempt = datetime('now','localtime'),
      resolved = 0
  `);
  const resolveWrong = db.prepare(
    "UPDATE wrong_questions SET resolved = 1 WHERE user_id = ? AND question_id = ?"
  );

  const tx = db.transaction(() => {
    for (const item of items) {
      const q = getQuestionById(item.question_id);
      if (!q) continue;
      const correct = checkAnswer(q, item.user_answer);
      insertRecord.run(userId, q.id, item.user_answer, correct ? 1 : 0);
      if (correct) {
        resolveWrong.run(userId, q.id);
      } else {
        upsertWrong.run(userId, q.id);
      }
      results.push({
        question_id: q.id,
        is_correct: correct,
        explanation: q.explanation,
        correct_answer: q.answer,
      });
    }
  });
  tx();
  return results;
}

export interface UserStats {
  totalAnswered: number;
  correctCount: number;
  accuracy: number;
  wrongCount: number;
  byCategory: { category: string; total: number; correct: number; accuracy: number }[];
}

export function getUserStats(userId: number): UserStats {
  const totalRow = db
    .prepare(
      "SELECT COUNT(*) AS total, SUM(is_correct) AS correct FROM practice_records WHERE user_id = ?"
    )
    .get(userId) as any;
  const totalAnswered = totalRow.total || 0;
  const correctCount = totalRow.correct || 0;
  const wrongCount = (
    db.prepare("SELECT COUNT(*) AS c FROM wrong_questions WHERE user_id = ? AND resolved = 0").get(userId) as any
  ).c;

  const byCategoryRows = db
    .prepare(
      `SELECT q.category, COUNT(*) AS total, SUM(r.is_correct) AS correct
       FROM practice_records r JOIN questions q ON r.question_id = q.id
       WHERE r.user_id = ? GROUP BY q.category`
    )
    .all(userId) as any[];
  const byCategory = byCategoryRows.map((r) => ({
    category: r.category,
    total: r.total,
    correct: r.correct,
    accuracy: r.total ? Math.round((r.correct / r.total) * 100) : 0,
  }));

  return {
    totalAnswered,
    correctCount,
    accuracy: totalAnswered ? Math.round((correctCount / totalAnswered) * 100) : 0,
    wrongCount,
    byCategory,
  };
}

export function getWrongQuestions(userId: number): Question[] {
  const rows = db
    .prepare(
      `SELECT q.* FROM wrong_questions w JOIN questions q ON w.question_id = q.id
       WHERE w.user_id = ? AND w.resolved = 0 ORDER BY w.last_attempt DESC`
    )
    .all(userId);
  return rows.map(rowToQuestion);
}
