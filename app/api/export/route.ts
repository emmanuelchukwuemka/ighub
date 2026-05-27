import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transformToCSV } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  // Allow either a query secret or an admin cookie named `admin_token`.
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieToken = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("admin_token="))
    ?.split("=")[1];

  if (secret !== process.env.ADMIN_SECRET && cookieToken !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  type RegistrationRow = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    childName: string;
    childAge: number;
    location: string;
    course: string;
    referralCode: string | null;
    referredBy: string | null;
    paid: boolean;
    paystackReference: string | null;
    createdAt: Date;
  };
  const registrations = (await db.registration.findMany({ orderBy: { createdAt: "desc" } })) as RegistrationRow[];
  const csv = transformToCSV(
    registrations.map((registration) => ({
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone,
      childName: registration.childName,
      childAge: registration.childAge,
      location: registration.location,
      course: registration.course,
      referralCode: registration.referralCode,
      referredBy: registration.referredBy,
      paid: registration.paid,
      paystackReference: registration.paystackReference,
      createdAt: registration.createdAt.toISOString(),
    }))
  );

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=registrations.csv",
    },
  });
}
