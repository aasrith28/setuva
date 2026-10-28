import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  setSessionCookie,
} from "@/lib/auth/session";

describe("SETUVA Authentication & Session Security", () => {
  it("securely hashes passwords with salt and verifies matches", async () => {
    const rawPass = "KarnatakaStudent2026!";
    const hash = await hashPassword(rawPass);

    expect(hash).not.toBe(rawPass);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

    const matches = await verifyPassword(rawPass, hash);
    expect(matches).toBe(true);

    const wrongMatches = await verifyPassword("WrongPassword123!", hash);
    expect(wrongMatches).toBe(false);
  });

  it("signs and verifies JWT session tokens with tamper detection", async () => {
    const payload = {
      userId: "user-12345",
      email: "student@setuva.org",
      role: "user" as const,
      name: "Student Aravind",
    };

    const token = await createSessionToken(payload);
    expect(token).toBeDefined();

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe(payload.role);

    // Tampered token must fail verification
    const tamperedToken = token.slice(0, -6) + "xxxxxx";
    const failedVerify = await verifySessionToken(tamperedToken);
    expect(failedVerify).toBeNull();
  });

  it("enforces secure cookie attributes", () => {
    const cookie = setSessionCookie("mock-token-xyz");
    expect(cookie.name).toBe("setuva_session");
    expect(cookie.options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  });
});
