import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthenticated() {
  const cookieToken = cookies().get("admin_token")?.value;
  return ADMIN_SECRET && cookieToken === ADMIN_SECRET;
}

export async function GET() {
  try {
    let settings = await db.systemSettings.findFirst();
    if (!settings) {
      settings = await db.systemSettings.create({
        data: { campDate: new Date("2026-08-01T09:00:00Z") }
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { campDate } = await request.json();
    let settings = await db.systemSettings.findFirst();
    
    if (!settings) {
      settings = await db.systemSettings.create({
        data: { campDate: new Date(campDate) }
      });
    } else {
      settings = await db.systemSettings.update({
        where: { id: settings.id },
        data: { campDate: new Date(campDate) }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
