/**
 * ApplyRight Deterministic Eligibility Engine
 * Evaluates structured rules against user inputs with explainable outcomes.
 * Compliant with ARCHITECTURE.md Section 7 and SECURITY.md Section 11.
 */

export interface RuleDefinition {
  id: string;
  field: string;
  operator: "equals" | "in" | "lte" | "gte" | "contains" | "boolean" | string;
  expectedValue: string;
  explanation: string;
  isMandatory: boolean;
}

export type CriterionResult = "pass" | "fail" | "unknown";

export interface CriterionEvaluation {
  ruleId: string;
  field: string;
  criterion: string;
  result: CriterionResult;
  explanation: string;
  expectedValue: string;
  userAnswer?: unknown;
}

export type EligibilityOutcome =
  | "potentially_eligible"
  | "not_eligible"
  | "insufficient_information"
  | "needs_official_verification";

export interface EligibilityResult {
  outcome: EligibilityOutcome;
  summary: string;
  criteria: CriterionEvaluation[];
  missingAnswers: string[];
  serviceVersion: string;
  checkedAt: string;
  notice: string;
}

/**
 * Deterministically evaluates rules against user-provided answers.
 */
export function evaluateEligibility(
  rules: RuleDefinition[],
  userAnswers: Record<string, unknown>,
  serviceStatus: string = "verified",
  serviceVersion: string = "1.0.0"
): EligibilityResult {
  const checkedAt = new Date().toISOString();
  const notice =
    "This assessment provides informational guidance based on published rules, not an official government guarantee. Final eligibility is determined by the official issuing authority.";

  // If service status is stale or conflicting, outcome must reflect official verification needed
  if (serviceStatus === "stale" || serviceStatus === "conflicting") {
    return {
      outcome: "needs_official_verification",
      summary:
        "The published requirements for this scheme are currently marked as stale or conflicting and require official re-verification.",
      criteria: [],
      missingAnswers: [],
      serviceVersion,
      checkedAt,
      notice,
    };
  }

  if (!rules || rules.length === 0) {
    return {
      outcome: "insufficient_information",
      summary: "No eligibility rules have been published for this service yet.",
      criteria: [],
      missingAnswers: [],
      serviceVersion,
      checkedAt,
      notice,
    };
  }

  const criteria: CriterionEvaluation[] = [];
  const missingAnswers: string[] = [];

  let hasMandatoryFailure = false;
  let hasMissingRequiredAnswer = false;

  for (const rule of rules) {
    const rawAnswer = userAnswers[rule.field];

    if (rawAnswer === undefined || rawAnswer === null || rawAnswer === "") {
      if (rule.isMandatory) {
        hasMissingRequiredAnswer = true;
        missingAnswers.push(rule.field);
      }
      criteria.push({
        ruleId: rule.id,
        field: rule.field,
        criterion: rule.explanation,
        result: "unknown",
        explanation: `Answer missing for '${rule.field}'.`,
        expectedValue: rule.expectedValue,
      });
      continue;
    }

    const passes = evaluateRule(rule.operator, rawAnswer, rule.expectedValue);

    if (passes) {
      criteria.push({
        ruleId: rule.id,
        field: rule.field,
        criterion: rule.explanation,
        result: "pass",
        explanation: `Requirement satisfied (${String(rawAnswer)} matches ${rule.expectedValue}).`,
        expectedValue: rule.expectedValue,
        userAnswer: rawAnswer,
      });
    } else {
      if (rule.isMandatory) {
        hasMandatoryFailure = true;
      }
      criteria.push({
        ruleId: rule.id,
        field: rule.field,
        criterion: rule.explanation,
        result: "fail",
        explanation: `Requirement not satisfied (${String(rawAnswer)} does not satisfy ${rule.expectedValue}).`,
        expectedValue: rule.expectedValue,
        userAnswer: rawAnswer,
      });
    }
  }

  let outcome: EligibilityOutcome;
  let summary: string;

  if (hasMandatoryFailure) {
    outcome = "not_eligible";
    summary = "Based on the published criteria, one or more mandatory eligibility requirements were not met.";
  } else if (hasMissingRequiredAnswer) {
    outcome = "insufficient_information";
    summary = "Additional information is required to verify your eligibility for this scheme.";
  } else {
    outcome = "potentially_eligible";
    summary =
      "All known required published criteria are satisfied. You appear potentially eligible for this scheme.";
  }

  return {
    outcome,
    summary,
    criteria,
    missingAnswers,
    serviceVersion,
    checkedAt,
    notice,
  };
}

function evaluateRule(operator: string, answer: unknown, expected: string): boolean {
  const normExpected = expected.trim().toLowerCase();

  switch (operator) {
    case "equals": {
      return String(answer).trim().toLowerCase() === normExpected;
    }
    case "boolean": {
      const boolVal =
        typeof answer === "boolean"
          ? answer
          : String(answer).toLowerCase() === "true" || String(answer).toLowerCase() === "yes";
      const expBool = normExpected === "true" || normExpected === "yes";
      return boolVal === expBool;
    }
    case "lte": {
      const numAnswer = Number(answer);
      const numExpected = Number(normExpected);
      if (isNaN(numAnswer) || isNaN(numExpected)) return false;
      return numAnswer <= numExpected;
    }
    case "gte": {
      const numAnswer = Number(answer);
      const numExpected = Number(normExpected);
      if (isNaN(numAnswer) || isNaN(numExpected)) return false;
      return numAnswer >= numExpected;
    }
    case "in": {
      const allowedList = normExpected
        .split(",")
        .map((item) => item.trim().toLowerCase());
      const val = String(answer).trim().toLowerCase();
      return allowedList.includes(val);
    }
    case "contains": {
      return String(answer).toLowerCase().includes(normExpected);
    }
    default:
      return false;
  }
}
