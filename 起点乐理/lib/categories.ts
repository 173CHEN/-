import type { CategoryMeta, Category } from "./types";

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "interval",
    name: "音程",
    icon: "🎵",
    desc: "音程识别、音程计算",
  },
  {
    id: "chord",
    name: "和弦",
    icon: "🎹",
    desc: "三和弦、七和弦识别",
  },
  {
    id: "mode",
    name: "调式调性",
    icon: "🎼",
    desc: "大小调、调号",
  },
  {
    id: "rhythm",
    name: "节奏节拍",
    icon: "🥁",
    desc: "时值、拍号",
  },
  {
    id: "notation",
    name: "乐谱识读",
    icon: "📜",
    desc: "五线谱音符识别",
  },
  {
    id: "terms",
    name: "音乐术语与记号",
    icon: "📖",
    desc: "常用术语与演奏记号",
  },
];

export const TYPE_LABELS: Record<string, string> = {
  choice: "选择题",
  fill: "填空题",
  judge: "判断题",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export function categoryName(id: Category): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}
