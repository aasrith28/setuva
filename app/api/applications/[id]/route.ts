import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { updateTrackerSchema } from "@/lib/validation/schemas";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const tracker = await prisma.applicationTracker.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            sources: {
              where: { verificationStatus: "verified" },
            },
          },
        },
        checklist: {
          orderBy: { createdAt: "asc" },
        },
        reminders: {
          where: { isCancelled: false },
          orderBy: { remindAt: "asc" },
        },
      },
    });

    if (!tracker) {
      return NextResponse.json({ error: "Application tracker not found." }, { status: 404 });
    }

    // Ownership check (SECURITY.md Section 5 - Prevent IDOR)
    if (tracker.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You do not own this tracker." }, { status: 403 });
    }

    return NextResponse.json({ tracker });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve application tracker." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const tracker = await prisma.applicationTracker.findUnique({
      where: { id },
    });

    if (!tracker) {
      return NextResponse.json({ error: "Application tracker not found." }, { status: 404 });
    }

    // Ownership check
    if (tracker.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You do not own this tracker." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateTrackerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update data.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.applicationTracker.update({
      where: { id },
      data: {
        ...(parsed.data.status && { status: parsed.data.status }),
        ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      },
    });

    return NextResponse.json({ tracker: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update application tracker." },
      { status: 500 }
    );
  }
}
