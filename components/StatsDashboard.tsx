"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CATEGORIES, categoryName } from "@/lib/categories";

interface Stats {
  totalAnswered: number;
  correctCount: number;
  accuracy: number;
  wrongCount: number;
  byCategory: { category: string; total: number; correct: number; accuracy: number }[];
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return <div className="py-10 text-center text-gray-500">加载中...</div>;

  const radarData = CATEGORIES.map((c) => {
    const row = stats.byCategory.find((b) => b.category === c.id);
    return {
      subject: c.name,
      正确率: row ? row.accuracy : 0,
      fullMark: 100,
    };
  });

  const barData = CATEGORIES.map((c) => {
    const row = stats.byCategory.find((b) => b.category === c.id);
    return {
      name: c.name,
      已做题数: row ? row.total : 0,
      正确数: row ? row.correct : 0,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">学习数据</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="累计答题" value={stats.totalAnswered} color="text-brand-600" />
        <StatCard label="正确题数" value={stats.correctCount} color="text-green-600" />
        <StatCard label="正确率" value={`${stats.accuracy}%`} color="text-blue-600" />
        <StatCard label="待复习错题" value={stats.wrongCount} color="text-red-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-800">知识点掌握雷达</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="正确率"
                  dataKey="正确率"
                  stroke="#7c3aed"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-800">各知识点答题量</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="已做题数" fill="#c4b5fd" />
                <Bar dataKey="正确数" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold text-gray-800">各知识点明细</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2 text-left">知识点</th>
                <th className="py-2 text-right">已做</th>
                <th className="py-2 text-right">正确</th>
                <th className="py-2 text-right">正确率</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((c) => {
                const row = stats.byCategory.find((b) => b.category === c.id);
                return (
                  <tr key={c.id} className="border-b">
                    <td className="py-2">
                      {c.icon} {c.name}
                    </td>
                    <td className="py-2 text-right">{row?.total ?? 0}</td>
                    <td className="py-2 text-right">{row?.correct ?? 0}</td>
                    <td className="py-2 text-right font-medium">
                      {row ? `${row.accuracy}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="card">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
