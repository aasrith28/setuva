import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const jurisdiction = searchParams.get("jurisdiction");
    const search = searchParams.get("search");

    const session = await getSession(req);
    const isAdminOrReviewer =
      session && (session.role === "admin" || session.role === "content_reviewer" || session.role === "publisher");

    const where: any = {};

    // Ordinary users only see verified/published services
    if (!isAdminOrReviewer) {
      where.status = { in: ["verified", "published"] };
    }

    if (category) {
      where.category = category;
    }

    if (jurisdiction) {
      where.jurisdiction = jurisdiction;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        jurisdiction: true,
        description: true,
        officialApplicationUrl: true,
        status: true,
        currentVersion: true,
        updatedAt: true,
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

    return NextResponse.json({ services });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve government service catalogue." },
      { status: 500 }
    );
  }
}
