import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret = body?.secret;
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ message: "Invalid admin secret" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    // Set an HTTP-only cookie so admin pages can be accessed without exposing the secret in URL
    res.cookies.set({
      name: "admin_token",
      value: process.env.ADMIN_SECRET || "",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
