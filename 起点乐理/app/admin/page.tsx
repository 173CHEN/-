import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");
  return <AdminPanel />;
}
