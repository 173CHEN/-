"use client";
import { useState } from "react";

export default function AdminPanel() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    setResult(null);
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const students = lines.map((l) => {
      const [username, password] = l.split(/[,\s]+/);
      return { username, password };
    });
    if (students.length === 0) {
      setError("请输入学生账号");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/add-students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "添加失败");
      return;
    }
    setResult(data);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">老师后台 · 批量添加学生</h1>
      <div className="card">
        <p className="mb-2 text-sm text-gray-600">
          每行一个学生，格式：<code className="rounded bg-gray-100 px-1">用户名 密码</code> 或{" "}
          <code className="rounded bg-gray-100 px-1">用户名,密码</code>
        </p>
        <textarea
          className="input h-48 font-mono"
          placeholder={"student1 123456\nstudent2 123456\nstudent3,abc123"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleAdd} disabled={loading} className="btn-primary mt-3">
          {loading ? "添加中..." : "批量添加"}
        </button>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {result && (
          <div className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            成功添加 {result.added} 个学生{result.skipped > 0 ? `，跳过 ${result.skipped} 个（已存在或格式错误）` : ""}。
          </div>
        )}
      </div>
    </div>
  );
}
