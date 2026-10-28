import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("SETUVA Rate Limiter Defense", () => {
  it("allows requests under the specified limit", () => {
    const key = `test-ip-${Date.now()}`;
    const limit = 5;

    for (let i = 1; i <= limit; i++) {
      const res = checkRateLimit(key, limit, 60000);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(limit - i);
    }
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `blocked-ip-${Date.now()}`;
    const limit = 3;

    // Consume all tokens
    for (let i = 0; i < limit; i++) {
      checkRateLimit(key, limit, 60000);
    }

    // 4th request must be blocked
    const blockedRes = checkRateLimit(key, limit, 60000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  it("resets rate limit counter after the time window expires", () => {
    const key = `expiring-ip-${Date.now()}`;
    const limit = 2;
    const windowMs = 50; // 50ms window

    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);
    const blocked = checkRateLimit(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const afterExpiry = checkRateLimit(key, limit, windowMs);
        expect(afterExpiry.allowed).toBe(true);
        expect(afterExpiry.remaining).toBe(limit - 1);
        resolve();
      }, 70);
    });
  });
});
