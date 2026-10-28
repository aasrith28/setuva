import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Publishers and Admins only — content_reviewer alone cannot publish
    const session = await requireRole(req, ["publisher", "admin"]);

    const { id } = params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        rules: true,
        documents: true,
        sources: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    // Bump version and set status to verified / published
    const newVersion = "1.0.1";

    const updated = await prisma.service.update({
      where: { id },
      data: {
        status: "verified",
        currentVersion: newVersion,
        revisions: {
          create: {
            version: newVersion,
            changeSummary: "Approved and published after verification review.",
            authorId: session.userId,
            snapshot: JSON.stringify(service),
          },
        },
      },
    });

    // Write to audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.role,
        action: "SERVICE_PUBLISHED",
        entityType: "Service",
        entityId: service.id,
        details: JSON.stringify({ version: newVersion, previousStatus: service.status }),
      },
    });

    return NextResponse.json({
      message: "Service published successfully.",
      service: updated,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden: Publishing requires publisher or admin privilege." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Failed to publish service." }, { status: 500 });
  }
}
