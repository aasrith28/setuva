import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { saveServiceSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.savedService.findMany({
      where: { userId: session.userId },
      include: {
        service: {
          select: {
            id: true,
            slug: true,
            name: true,
            category: true,
            description: true,
            status: true,
            officialApplicationUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedServices: saved });
  } catch {
    return NextResponse.json(
      { error: "Failed to load saved services." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = saveServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { serviceId } = parsed.data;

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const saved = await prisma.savedService.upsert({
      where: {
        userId_serviceId: {
          userId: session.userId,
          serviceId,
        },
      },
      create: {
        userId: session.userId,
        serviceId,
      },
      update: {},
    });

    return NextResponse.json({ message: "Service saved.", savedService: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save service." }, { status: 500 });
  }
}
