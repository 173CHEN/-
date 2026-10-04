import Link from "next/link";
import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { getCurrentUser } from "@/lib/auth";

export default async function PracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">选择知识点</h1>
      <p className="text-gray-500">点击下方卡片开始对应知识点的练习，每次随机抽取 10 道题。</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/quiz?category=${c.id}`}
            className="card transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">{c.icon}</div>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">{c.name}</h3>
            <p className="text-sm text-gray-500">{c.desc}</p>
            <div className="mt-3 text-sm font-medium text-brand-600">开始练习 →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
