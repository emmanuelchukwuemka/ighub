import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthenticated() {
  const cookieToken = cookies().get("admin_token")?.value;
  return ADMIN_SECRET && cookieToken === ADMIN_SECRET;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = params;

    const updatedRegistration = await db.registration.update({
      where: { id: parseInt(id, 10) },
      data: body,
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error("Failed to update registration:", error);
    return NextResponse.json({ message: "Failed to update registration" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    await db.registration.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Failed to delete registration:", error);
    return NextResponse.json({ message: "Failed to delete registration" }, { status: 500 });
  }
}
