import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  eligibilityCheckSchema,
  createTrackerSchema,
  createServiceSchema,
} from "@/lib/validation/schemas";

describe("SETUVA Request Validation & Authorization Schema Security", () => {
  it("enforces strict password complexity on registration", () => {
    // Missing uppercase
    const noUpper = registerSchema.safeParse({
      name: "Student",
      email: "test@example.com",
      password: "password123",
    });
    expect(noUpper.success).toBe(false);

    // Missing number
    const noNumber = registerSchema.safeParse({
      name: "Student",
      email: "test@example.com",
      password: "PasswordWithoutNumber",
    });
    expect(noNumber.success).toBe(false);

    // Too short
    const tooShort = registerSchema.safeParse({
      name: "Student",
      email: "test@example.com",
      password: "Short1!",
    });
    expect(tooShort.success).toBe(false);

    // Valid
    const valid = registerSchema.safeParse({
      name: "Aravind Kumar",
      email: "aravind@example.com",
      password: "ValidPassword123!",
    });
    expect(valid.success).toBe(true);
  });

  it("validates UUID format for service and tracker identifiers to prevent injection", () => {
    const invalidServiceId = eligibilityCheckSchema.safeParse({
      serviceId: "invalid-id-or-sql-injection'--",
      answers: { state: "Karnataka" },
    });
    expect(invalidServiceId.success).toBe(false);

    const validUuid = eligibilityCheckSchema.safeParse({
      serviceId: "123e4567-e89b-12d3-a456-426614174000",
      answers: { state: "Karnataka" },
    });
    expect(validUuid.success).toBe(true);
  });

  it("rejects invalid slugs and missing required fields in administrative creation", () => {
    const invalidSlug = createServiceSchema.safeParse({
      name: "Test Scheme",
      slug: "INVALID SLUG WITH SPACES AND CAPS",
      category: "Scholarships",
      description: "A valid description of the government scheme with sufficient length.",
      officialApplicationUrl: "https://karnataka.gov.in",
    });
    expect(invalidSlug.success).toBe(false);

    const validService = createServiceSchema.safeParse({
      name: "Test Scheme Karnataka",
      slug: "test-scheme-karnataka",
      category: "Scholarships",
      description: "A valid description of the government scheme with sufficient length.",
      officialApplicationUrl: "https://karnataka.gov.in",
    });
    expect(validService.success).toBe(true);
  });
});
