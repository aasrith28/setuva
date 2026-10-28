import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { createReminderSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: session.userId, isCancelled: false },
      include: {
        tracker: {
          include: {
            service: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { remindAt: "asc" },
    });

    return NextResponse.json({ reminders });
  } catch {
    return NextResponse.json({ error: "Failed to load reminders." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createReminderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid reminder data.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { trackerId, remindAt, timezone, message } = parsed.data;

    if (trackerId) {
      const tracker = await prisma.applicationTracker.findUnique({
        where: { id: trackerId },
      });
      if (!tracker || (tracker.userId !== session.userId && session.role !== "admin")) {
        return NextResponse.json(
          { error: "Forbidden: You do not own this application tracker." },
          { status: 403 }
        );
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.userId,
        trackerId: trackerId || null,
        remindAt: new Date(remindAt),
        timezone,
        message,
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create reminder." }, { status: 500 });
  }
}
