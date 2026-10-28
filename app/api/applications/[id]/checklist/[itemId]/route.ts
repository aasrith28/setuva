import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { updateChecklistItemSchema } from "@/lib/validation/schemas";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: trackerId, itemId } = params;

    // Load tracker to verify ownership
    const tracker = await prisma.applicationTracker.findUnique({
      where: { id: trackerId },
    });

    if (!tracker) {
      return NextResponse.json({ error: "Application tracker not found." }, { status: 404 });
    }

    // Ownership check (SECURITY.md Section 5 - Prevent IDOR)
    if (tracker.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You do not own this tracker." }, { status: 403 });
    }

    const checklistItem = await prisma.checklistItem.findFirst({
      where: { id: itemId, trackerId },
    });

    if (!checklistItem) {
      return NextResponse.json({ error: "Checklist item not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateChecklistItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checklist item update.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(parsed.data.isCompleted !== undefined && { isCompleted: parsed.data.isCompleted }),
        ...(parsed.data.note !== undefined && { note: parsed.data.note }),
      },
    });

    return NextResponse.json({ checklistItem: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update checklist item." },
      { status: 500 }
    );
  }
}
