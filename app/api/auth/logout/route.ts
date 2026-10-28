import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const cookieData = clearSessionCookie();
  const res = NextResponse.json({ message: "Signed out successfully." });
  res.cookies.set(cookieData.name, cookieData.value, cookieData.options as any);
  return res;
}
