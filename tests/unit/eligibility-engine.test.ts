import { describe, it, expect } from "vitest";
import { evaluateEligibility, RuleDefinition } from "@/modules/eligibility/engine";

describe("SETUVA Deterministic Eligibility Engine", () => {
  const sampleRules: RuleDefinition[] = [
    {
      id: "rule-1",
      field: "state",
      operator: "equals",
      expectedValue: "Karnataka",
      explanation: "Applicant must be a permanent resident of Karnataka.",
      isMandatory: true,
    },
    {
      id: "rule-2",
      field: "annualFamilyIncome",
      operator: "lte",
      expectedValue: "250000",
      explanation: "Annual family gross income must not exceed ₹2,50,000.",
      isMandatory: true,
    },
    {
      id: "rule-3",
      field: "educationLevel",
      operator: "in",
      expectedValue: "undergraduate,postgraduate,diploma",
      explanation: "Enrolled in higher education degree.",
      isMandatory: true,
    },
    {
      id: "rule-4",
      field: "inHostel",
      operator: "boolean",
      expectedValue: "false",
      explanation: "Must not reside in government hostel.",
      isMandatory: false,
    },
  ];

  it("returns 'potentially_eligible' when all mandatory criteria pass", () => {
    const answers = {
      state: "Karnataka",
      annualFamilyIncome: "200000",
      educationLevel: "undergraduate",
      inHostel: false,
    };

    const res = evaluateEligibility(sampleRules, answers, "verified", "1.0.0");
    expect(res.outcome).toBe("potentially_eligible");
    expect(res.missingAnswers).toHaveLength(0);
    expect(res.criteria.every((c) => c.result === "pass")).toBe(true);
    expect(res.notice).toContain("informational guidance");
  });

  it("returns 'not_eligible' when a mandatory rule fails", () => {
    const answers = {
      state: "Karnataka",
      annualFamilyIncome: "350000", // exceeds 250000
      educationLevel: "undergraduate",
    };

    const res = evaluateEligibility(sampleRules, answers, "verified", "1.0.0");
    expect(res.outcome).toBe("not_eligible");
    const incomeCriterion = res.criteria.find((c) => c.field === "annualFamilyIncome");
    expect(incomeCriterion?.result).toBe("fail");
  });

  it("returns 'insufficient_information' when mandatory answers are missing", () => {
    const answers = {
      state: "Karnataka",
      // annualFamilyIncome and educationLevel missing
    };

    const res = evaluateEligibility(sampleRules, answers, "verified", "1.0.0");
    expect(res.outcome).toBe("insufficient_information");
    expect(res.missingAnswers).toContain("annualFamilyIncome");
    expect(res.missingAnswers).toContain("educationLevel");
  });

  it("returns 'needs_official_verification' when service status is stale or conflicting", () => {
    const answers = {
      state: "Karnataka",
      annualFamilyIncome: "100000",
      educationLevel: "diploma",
    };

    const resStale = evaluateEligibility(sampleRules, answers, "stale", "1.0.0");
    expect(resStale.outcome).toBe("needs_official_verification");

    const resConflicting = evaluateEligibility(sampleRules, answers, "conflicting", "1.0.0");
    expect(resConflicting.outcome).toBe("needs_official_verification");
  });

  it("evaluates boolean operator correctly for both boolean and string representations", () => {
    const boolRule: RuleDefinition[] = [
      {
        id: "b-1",
        field: "isEmployed",
        operator: "boolean",
        expectedValue: "false",
        explanation: "Must be unemployed",
        isMandatory: true,
      },
    ];

    expect(evaluateEligibility(boolRule, { isEmployed: false }).outcome).toBe("potentially_eligible");
    expect(evaluateEligibility(boolRule, { isEmployed: "false" }).outcome).toBe("potentially_eligible");
    expect(evaluateEligibility(boolRule, { isEmployed: true }).outcome).toBe("not_eligible");
  });
});
