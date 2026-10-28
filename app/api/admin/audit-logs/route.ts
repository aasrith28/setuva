import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["admin"]);

    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin privilege required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to retrieve audit logs." }, { status: 500 });
  }
}
