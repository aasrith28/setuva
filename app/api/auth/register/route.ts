import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validation/schemas";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: "user",
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role as "user",
      name: user.name,
    });

    const cookieData = setSessionCookie(token);

    const res = NextResponse.json(
      {
        message: "Account created successfully.",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      { status: 201 }
    );

    res.cookies.set(cookieData.name, cookieData.value, cookieData.options as any);
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: "Registration failed. Please verify your details and try again." },
      { status: 500 }
    );
  }
}
