import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/schemas";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    // Rate limit login attempts to 5 per minute per IP
    const rateCheck = checkRateLimit(`login:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again after 60 seconds." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password format." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Generic error to avoid account enumeration (SECURITY.md Section 4)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const cookieData = setSessionCookie(token);

    const res = NextResponse.json({
      message: "Signed in successfully.",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    res.cookies.set(cookieData.name, cookieData.value, cookieData.options as any);
    return res;
  } catch {
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
