import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-400 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">乐理刷题 · 在线练习平台</h1>
        <p className="mt-2 text-brand-50">
          按知识点分类练习，智能记录错题与学习进度，帮助学生系统提升乐理水平。
        </p>
        <div className="mt-4 flex gap-3">
          {user ? (
            <>
              <Link href="/practice" className="rounded-lg bg-white px-5 py-2 font-medium text-brand-700 shadow hover:bg-brand-50">
                开始练习
              </Link>
              <Link href="/dashboard" className="rounded-lg border border-white/40 px-5 py-2 font-medium text-white hover:bg-white/10">
                查看学习数据
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="rounded-lg bg-white px-5 py-2 font-medium text-brand-700 shadow hover:bg-brand-50">
                免费注册
              </Link>
              <Link href="/login" className="rounded-lg border border-white/40 px-5 py-2 font-medium text-white hover:bg-white/10">
                已有账号，登录
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">按知识点练习</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={user ? `/quiz?category=${c.id}` : "/login"}
              className="card transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-3xl">{c.icon}</div>
              <h3 className="mt-2 text-lg font-semibold text-gray-800">{c.name}</h3>
              <p className="text-sm text-gray-500">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/exam" className="card hover:bg-gray-50">
          <div className="text-2xl">📝</div>
          <h3 className="mt-2 font-semibold">模拟考试</h3>
          <p className="text-sm text-gray-500">随机组卷，限时作答，检验综合水平</p>
        </Link>
        <Link href="/wrong" className="card hover:bg-gray-50">
          <div className="text-2xl">❌</div>
          <h3 className="mt-2 font-semibold">错题本</h3>
          <p className="text-sm text-gray-500">自动收集错题，反复练习巩固</p>
        </Link>
        <Link href="/dashboard" className="card hover:bg-gray-50">
          <div className="text-2xl">📊</div>
          <h3 className="mt-2 font-semibold">学习数据</h3>
          <p className="text-sm text-gray-500">正确率、完成数、知识点掌握情况</p>
        </Link>
      </section>
    </div>
  );
}
