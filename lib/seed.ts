import type Database from "better-sqlite3";
import { SEED_QUESTIONS } from "./seedData";

export function seedQuestions(db: Database.Database, force = false) {
  const count = (db.prepare("SELECT COUNT(*) AS c FROM questions").get() as { c: number }).c;
  if (count > 0 && !force) {
    console.log(`题库已存在 ${count} 道题，跳过导入。`);
    return count;
  }
  if (force) {
    db.exec("DELETE FROM questions; DELETE FROM sqlite_sequence WHERE name='questions';");
  }
  const insert = db.prepare(`
    INSERT INTO questions (category, type, difficulty, content, options, answer, explanation, image_url)
    VALUES (@category, @type, @difficulty, @content, @options, @answer, @explanation, @image_url)
  `);
  const tx = db.transaction((items: any[]) => {
    for (const q of items) {
      insert.run({
        category: q.category,
        type: q.type,
        difficulty: q.difficulty,
        content: q.content,
        options: q.options ? JSON.stringify(q.options) : null,
        answer: q.answer,
        explanation: q.explanation,
        image_url: q.image_url ?? null,
      });
    }
  });
  tx(SEED_QUESTIONS);
  console.log(`已导入 ${SEED_QUESTIONS.length} 道题目。`);
  return SEED_QUESTIONS.length;
}

// 独立脚本运行：tsx lib/seed.ts
if (require.main === module) {
  import("./db").then(({ default: db }) => {
    seedQuestions(db, true);
    process.exit(0);
  });
}
