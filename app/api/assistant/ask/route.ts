import { NextRequest, NextResponse } from "next/server";
import { assistantAskSchema } from "@/lib/validation/schemas";
import { askAssistant } from "@/modules/assistant/service";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    // Rate limit AI requests to 10 per minute to prevent cost exhaustion and abuse (SECURITY.md Section 6)
    const rateCheck = checkRateLimit(`assistant:${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many AI assistant requests. Please wait a moment before asking again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = assistantAskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid question request.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { question, serviceId } = parsed.data;

    const result = await askAssistant(question, serviceId);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "The AI assistant service encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
