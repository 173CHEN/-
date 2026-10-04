import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import QuizEngine from "@/components/QuizEngine";

export default async function WrongPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <Suspense fallback={<div className="py-10 text-center">加载中...</div>}>
      <QuizEngine mode="wrong" />
    </Suspense>
  );
}
