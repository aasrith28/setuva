import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const saved = await prisma.savedService.findUnique({
      where: { id },
    });

    if (!saved) {
      return NextResponse.json({ error: "Saved service record not found." }, { status: 404 });
    }

    // Ownership check (SECURITY.md Section 5)
    if (saved.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You do not own this record." }, { status: 403 });
    }

    await prisma.savedService.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Saved service removed." });
  } catch {
    return NextResponse.json({ error: "Failed to remove saved service." }, { status: 500 });
  }
}
