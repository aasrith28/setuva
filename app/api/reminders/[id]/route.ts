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

    const reminder = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
    }

    // Ownership check (SECURITY.md Section 5)
    if (reminder.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You do not own this reminder." }, { status: 403 });
    }

    await prisma.reminder.update({
      where: { id },
      data: { isCancelled: true },
    });

    return NextResponse.json({ message: "Reminder cancelled." });
  } catch {
    return NextResponse.json({ error: "Failed to cancel reminder." }, { status: 500 });
  }
}
