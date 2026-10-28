import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Support both ID and Slug
    const service = await prisma.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        rules: {
          select: {
            id: true,
            field: true,
            operator: true,
            expectedValue: true,
            explanation: true,
            isMandatory: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            isMandatory: true,
            guidance: true,
            officialSourceId: true,
          },
        },
        sources: {
          select: {
            id: true,
            url: true,
            issuingAuthority: true,
            sourceType: true,
            lastCheckedDate: true,
            verificationStatus: true,
            excerpt: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve service details." },
      { status: 500 }
    );
  }
}
