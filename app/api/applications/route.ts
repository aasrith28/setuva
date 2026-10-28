import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { createTrackerSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trackers = await prisma.applicationTracker.findMany({
      where: { userId: session.userId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            officialApplicationUrl: true,
          },
        },
        checklist: {
          select: {
            id: true,
            title: true,
            isRequired: true,
            isCompleted: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ applications: trackers });
  } catch {
    return NextResponse.json(
      { error: "Failed to load application trackers." },
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
    const parsed = createTrackerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tracker creation request.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { serviceId, notes } = parsed.data;

    // Load service and its required documents
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        documents: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    // Check if tracker already exists for this service
    let tracker = await prisma.applicationTracker.findUnique({
      where: {
        userId_serviceId: {
          userId: session.userId,
          serviceId,
        },
      },
      include: { checklist: true },
    });

    if (!tracker) {
      // Create tracker with checklist seeded from required documents and standard verification steps
      const checklistItemsToCreate = [
        {
          title: "Confirm Official Eligibility Criteria",
          isRequired: true,
          sourceReference: "Official Portal Guidelines",
        },
        ...service.documents.map((doc) => ({
          title: `Prepare: ${doc.name}`,
          isRequired: doc.isMandatory,
          sourceReference: doc.guidance,
        })),
        {
          title: "Submit Application on Official Government Portal",
          isRequired: true,
          sourceReference: service.officialApplicationUrl,
        },
        {
          title: "Download and Archive Application Acknowledgement Receipt",
          isRequired: true,
          sourceReference: "Post-submission verification",
        },
      ];

      tracker = await prisma.applicationTracker.create({
        data: {
          userId: session.userId,
          serviceId,
          notes: notes || null,
          checklist: {
            create: checklistItemsToCreate,
          },
        },
        include: {
          checklist: true,
          service: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    }

    return NextResponse.json({ tracker }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to initialize application tracker." },
      { status: 500 }
    );
  }
}
