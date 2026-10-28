import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { eligibilityCheckSchema } from "@/lib/validation/schemas";
import { evaluateEligibility } from "@/modules/eligibility/engine";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(`eligibility:${ip}`, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many eligibility check requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = eligibilityCheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid eligibility check request.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { serviceId, answers } = parsed.data;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        rules: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    const evaluation = evaluateEligibility(
      service.rules,
      answers,
      service.status,
      service.currentVersion
    );

    return NextResponse.json(evaluation);
  } catch {
    return NextResponse.json(
      { error: "Eligibility assessment failed. Please try again." },
      { status: 500 }
    );
  }
}
