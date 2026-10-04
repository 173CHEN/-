import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StatsDashboard from "@/components/StatsDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <StatsDashboard />;
}
