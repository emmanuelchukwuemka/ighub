import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initializePaystackPayment } from "@/lib/paystack";

function generateReferralCode() {
  return `KCC${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      childName,
      childAge,
      location,
      course,
      referralCode,
      amount,
    } = body;

    if (!firstName || !lastName || !email || !phone || !childName || !childAge || !location || !course) {
      return NextResponse.json({ message: "All required fields must be provided." }, { status: 400 });
    }

    const registration = await db.registration.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        childName,
        childAge: Number(childAge),
        location,
        course,
        referralCode: generateReferralCode(),
        referredBy: referralCode || null,
      },
    });

    const reference = `KCC-${registration.id}-${Date.now()}`;
    const paystack = await initializePaystackPayment(email, Number(amount), reference);

    await db.registration.update({
      where: { id: registration.id },
      data: { paystackReference: reference },
    });

    // If this registration was referred by another registration's referral code,
    // increment the referrer's referralCount so we can track referral rewards.
    if (referralCode) {
      await db.registration.updateMany({
        where: { referralCode: referralCode },
        data: { referralCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ authorization_url: paystack.data.authorization_url });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
