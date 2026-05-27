import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function AdminPage() {
  const cookieToken = cookies().get("admin_token")?.value;
  if (!ADMIN_SECRET || cookieToken !== ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const registrations = await db.registration.findMany({ orderBy: { createdAt: "desc" } });

  // Calculate simple metrics for the initial load
  const totalRegs = registrations.length;
  const paidRegs = registrations.filter(r => r.paid).length;
  const pendingRegs = totalRegs - paidRegs;
  const totalRevenue = paidRegs * 50000; // Early bird price

  return (
    <AdminDashboardClient 
      initialRegistrations={registrations} 
      totalRegs={totalRegs} 
      paidRegs={paidRegs} 
      pendingRegs={pendingRegs} 
      totalRevenue={totalRevenue} 
    />
  );
}
