import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../_lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/");
  }
  return <AdminDashboardClient />;
}
