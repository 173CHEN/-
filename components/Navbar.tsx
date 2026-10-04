import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <span className="text-2xl">🎵</span>
          <span>乐理刷题</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">首页</Link>
          <Link href="/practice" className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">知识点练习</Link>
          <Link href="/exam" className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">模拟考试</Link>
          <Link href="/wrong" className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">错题本</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">学习数据</Link>
              {user.role === "teacher" && (
                <Link href="/admin" className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">老师后台</Link>
              )}
              <form action="/api/auth/logout" method="post">
                <button className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">
                  退出({user.username})
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">登录</Link>
              <Link href="/register" className="btn-primary ml-2">注册</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
