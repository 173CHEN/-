// 知识点分类
export type Category =
  | "interval" // 音程
  | "chord" // 和弦
  | "mode" // 调式调性
  | "rhythm" // 节奏节拍
  | "notation" // 乐谱识读
  | "terms"; // 音乐术语与记号

// 题型
export type QuestionType = "choice" | "fill" | "judge";

// 难度
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: number;
  category: Category;
  type: QuestionType;
  difficulty: Difficulty;
  content: string;
  options: string[] | null; // 选择题选项
  answer: string; // 正确答案（选择题为选项索引字符串如 "0"，填空为文本，判断为 "true"/"false"）
  explanation: string;
  image_url: string | null;
}

export interface CategoryMeta {
  id: Category;
  name: string;
  icon: string;
  desc: string;
}

export interface User {
  id: number;
  username: string;
  role: "student" | "teacher";
  created_at: string;
}

export interface PracticeRecord {
  id: number;
  user_id: number;
  question_id: number;
  user_answer: string;
  is_correct: number;
  created_at: string;
}
