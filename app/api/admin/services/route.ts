import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { createServiceSchema } from "@/lib/validation/schemas";
import { validateOfficialUrl } from "@/lib/security/ssrf";

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, ["content_reviewer", "publisher", "admin"]);

    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: {
            rules: true,
            documents: true,
            sources: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ services, userRole: session.role });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied. Admin or reviewer privileges required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to list administrative services." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, ["content_reviewer", "admin"]);

    const body = await req.json();
    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid service data.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      category,
      jurisdiction,
      description,
      officialApplicationUrl,
      rules,
      documents,
    } = parsed.data;

    // Validate official source URL against SSRF and protocol rules
    const urlValidation = validateOfficialUrl(officialApplicationUrl);
    if (!urlValidation.isValid) {
      return NextResponse.json(
        { error: `Invalid official application URL: ${urlValidation.reason}` },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.service.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A service with this slug already exists." },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        category,
        jurisdiction,
        description,
        officialApplicationUrl: urlValidation.sanitizedUrl!,
        status: "draft",
        currentVersion: "1.0.0",
        ...(rules && rules.length > 0
          ? {
              rules: {
                create: rules.map((r) => ({
                  field: r.field,
                  operator: r.operator,
                  expectedValue: r.expectedValue,
                  explanation: r.explanation,
                  isMandatory: r.isMandatory ?? true,
                })),
              },
            }
          : {}),
        ...(documents && documents.length > 0
          ? {
              documents: {
                create: documents.map((d) => ({
                  name: d.name,
                  isMandatory: d.isMandatory ?? true,
                  guidance: d.guidance,
                })),
              },
            }
          : {}),
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.role,
        action: "SERVICE_CREATED",
        entityType: "Service",
        entityId: service.id,
        details: JSON.stringify({ slug: service.slug, name: service.name }),
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create service." }, { status: 500 });
  }
}
