import { z } from "zod";

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(100),
  password: z.string().min(1, "Password is required").max(100),
});

// Eligibility Check schema
export const eligibilityCheckSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID format"),
  answers: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

// Saved Service schema
export const saveServiceSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID format"),
});

// Application Tracker schemas
export const createTrackerSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID format"),
  notes: z.string().max(1000).optional(),
});

export const updateTrackerSchema = z.object({
  status: z
    .enum(["not_started", "in_progress", "documents_ready", "submitted_externally"])
    .optional(),
  notes: z.string().max(1000).optional(),
});

export const updateChecklistItemSchema = z.object({
  isCompleted: z.boolean().optional(),
  note: z.string().max(500).optional(),
});

// Reminder schema
export const createReminderSchema = z.object({
  trackerId: z.string().uuid().optional(),
  remindAt: z.string().datetime("Must be a valid ISO-8601 date timestamp"),
  timezone: z.string().max(50).default("Asia/Kolkata"),
  message: z.string().trim().min(3).max(300),
});

// AI Assistant schema
export const assistantAskSchema = z.object({
  serviceId: z.string().uuid().optional(),
  question: z
    .string()
    .trim()
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question cannot exceed 500 characters"),
});

// Admin Service & Source schemas
export const createServiceSchema = z.object({
  name: z.string().trim().min(3).max(150),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  category: z.string().trim().min(2).max(50),
  jurisdiction: z.string().trim().default("Karnataka"),
  description: z.string().trim().min(10).max(2000),
  officialApplicationUrl: z.string().trim().url(),
  rules: z
    .array(
      z.object({
        field: z.string().min(1).max(50),
        operator: z.enum(["equals", "in", "lte", "gte", "contains", "boolean"]),
        expectedValue: z.string().min(1).max(200),
        explanation: z.string().min(5).max(300),
        isMandatory: z.boolean().default(true),
      })
    )
    .optional(),
  documents: z
    .array(
      z.object({
        name: z.string().min(2).max(100),
        isMandatory: z.boolean().default(true),
        guidance: z.string().min(5).max(300),
      })
    )
    .optional(),
});

export const createSourceSchema = z.object({
  serviceId: z.string().uuid().optional(),
  url: z.string().trim().url(),
  issuingAuthority: z.string().trim().min(3).max(150),
  sourceType: z.enum(["portal", "gazette", "guidelines", "order"]),
  verificationStatus: z
    .enum(["pending_review", "verified", "stale", "conflicting", "retired"])
    .default("pending_review"),
  excerpt: z.string().trim().min(10).max(2000),
});
