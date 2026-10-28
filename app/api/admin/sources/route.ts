import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { createSourceSchema } from "@/lib/validation/schemas";
import { validateOfficialUrl } from "@/lib/security/ssrf";

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, ["content_reviewer", "admin"]);

    const body = await req.json();
    const parsed = createSourceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid source data.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { serviceId, url, issuingAuthority, sourceType, verificationStatus, excerpt } =
      parsed.data;

    // Validate URL against SSRF and protocol requirements (SECURITY.md Section 10)
    const urlValidation = validateOfficialUrl(url);
    if (!urlValidation.isValid) {
      return NextResponse.json(
        { error: `Invalid official source URL: ${urlValidation.reason}` },
        { status: 400 }
      );
    }

    const source = await prisma.officialSource.create({
      data: {
        serviceId: serviceId || null,
        url: urlValidation.sanitizedUrl!,
        issuingAuthority,
        sourceType,
        verificationStatus: verificationStatus || "pending_review",
        excerpt,
        lastCheckedDate: new Date(),
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.role,
        action: "OFFICIAL_SOURCE_CREATED",
        entityType: "OfficialSource",
        entityId: source.id,
        details: JSON.stringify({ url: source.url, authority: source.issuingAuthority }),
      },
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create official source record." }, { status: 500 });
  }
}
