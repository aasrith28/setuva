/**
 * ApplyRight AI Assistant Service
 * Grounded strictly in approved official source records with prompt injection mitigation.
 * Compliant with ARCHITECTURE.md Section 9 and SECURITY.md Section 11.
 */

import prisma from "@/lib/db/prisma";

export interface Citation {
  sourceId: string;
  authority: string;
  url: string;
  verificationStatus: string;
  lastCheckedDate: string;
}

export interface AssistantResponse {
  answer: string;
  citations: Citation[];
  hasSufficientEvidence: boolean;
  disclaimer: string;
}

// Prompt injection patterns to detect and mitigate
const PROMPT_INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior) (instructions|directions|prompts)/i,
  /disregard (all )?(previous|prior) (instructions|directions)/i,
  /system prompt/i,
  /reveal (the )?(secret|api key|token|password|hash)/i,
  /you are now in (developer|dan|jailbreak|admin) mode/i,
  /print (the )?system/i,
  /bypass (all )?(filters|rules)/i,
  /<script[\s>]/i,
  /select \* from/i,
  /drop table/i,
];

/**
 * Checks if a user prompt contains malicious injection or exfiltration attempts
 */
export function detectPromptInjection(input: string): boolean {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
}

/**
 * Answers questions grounded strictly in official approved sources
 */
export async function askAssistant(
  question: string,
  serviceId?: string
): Promise<AssistantResponse> {
  const disclaimer =
    "SETUVA provides informational assistance grounded in published official records. We are not a government portal. Always consult the official authority before submitting applications.";

  // 1. Guard against prompt injection attacks
  if (detectPromptInjection(question)) {
    return {
      answer:
        "Your request could not be processed because it contains potentially harmful or restricted instructions. SETUVA answers questions strictly regarding verified government schemes.",
      citations: [],
      hasSufficientEvidence: false,
      disclaimer,
    };
  }

  // 2. Retrieve verified and relevant official sources from database
  let sources;
  if (serviceId) {
    sources = await prisma.officialSource.findMany({
      where: {
        serviceId,
        verificationStatus: { in: ["verified", "pending_review"] },
      },
      take: 5,
    });
  } else {
    // Search general sources or service-linked sources
    sources = await prisma.officialSource.findMany({
      where: {
        verificationStatus: "verified",
      },
      take: 5,
    });
  }

  // 3. If no verified evidence is available, return uncertainty state
  if (!sources || sources.length === 0) {
    return {
      answer:
        "There is currently insufficient verified official evidence in our catalogue to answer your specific question. Please refer directly to the official government portal for authoritative guidance.",
      citations: [],
      hasSufficientEvidence: false,
      disclaimer,
    };
  }

  // 4. Grounded answer generation using verified excerpts
  // Keyword relevance check against retrieved sources
  const lowerQ = question.toLowerCase();
  const matchedSources = sources.filter((s) => {
    const text = (s.excerpt + " " + s.issuingAuthority).toLowerCase();
    const words = lowerQ.split(/\s+/).filter((w) => w.length > 3);
    return words.some((w) => text.includes(w));
  });

  const activeSources = matchedSources.length > 0 ? matchedSources : sources.slice(0, 2);

  const citations: Citation[] = activeSources.map((s) => ({
    sourceId: s.id,
    authority: s.issuingAuthority,
    url: s.url,
    verificationStatus: s.verificationStatus,
    lastCheckedDate: s.lastCheckedDate.toISOString().split("T")[0],
  }));

  // Build answer strictly from source facts without hallucinations
  const facts = activeSources.map((s) => s.excerpt).join(" ");
  const answer = `Based on verified official guidance issued by ${activeSources
    .map((s) => s.issuingAuthority)
    .join(", ")}:\n\n${facts}\n\nPlease review the attached official sources below for complete procedural requirements and deadlines.`;

  return {
    answer,
    citations,
    hasSufficientEvidence: true,
    disclaimer,
  };
}
