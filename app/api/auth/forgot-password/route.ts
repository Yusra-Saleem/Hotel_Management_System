import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Token expires in 15 minutes

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expires,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    // In a real application, you would send an email here.
    // For this example, we'll log the link to the console.
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
