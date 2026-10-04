"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role: isTeacher ? "teacher" : "student" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "注册失败");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">注册</h1>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">用户名</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="至少 2 位"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 4 位"
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isTeacher}
              onChange={(e) => setIsTeacher(e.target.checked)}
              className="h-4 w-4 text-brand-600"
            />
            我是老师（注册后可使用批量添加学生等后台功能）
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "注册中..." : "注册并登录"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          已有账号？<Link href="/login" className="text-brand-600 hover:underline">去登录</Link>
        </p>
      </div>
    </div>
  );
}
