import { describe, it, expect } from "vitest";
import { validateOfficialUrl } from "@/lib/security/ssrf";

describe("SETUVA SSRF and Official URL Validator", () => {
  it("approves official HTTPS government URLs", () => {
    const validGovUrls = [
      "https://ssp.postmatric.karnataka.gov.in/",
      "https://karepass.cgg.gov.in/index.html",
      "https://sevasindhu.karnataka.gov.in/Home.aspx",
      "https://scholarships.gov.in/",
    ];

    for (const url of validGovUrls) {
      const res = validateOfficialUrl(url);
      expect(res.isValid).toBe(true);
      expect(res.sanitizedUrl).toBeDefined();
    }
  });

  it("rejects non-HTTPS protocols", () => {
    const insecureUrls = [
      "http://ssp.postmatric.karnataka.gov.in/",
      "ftp://gov.in/schemes",
      "javascript:alert(1)",
      "file:///etc/passwd",
    ];

    for (const url of insecureUrls) {
      const res = validateOfficialUrl(url);
      expect(res.isValid).toBe(false);
      expect(res.reason).toContain("Only HTTPS protocol is permitted");
    }
  });

  it("blocks private IP ranges, loopback, and cloud metadata", () => {
    const maliciousSsrfUrls = [
      "https://localhost/admin",
      "https://127.0.0.1:8080/secrets",
      "https://10.0.0.1/internal-api",
      "https://192.168.1.1/router",
      "https://172.16.0.5/db",
      "https://169.254.169.254/latest/meta-data/", // AWS/Cloud metadata
      "https://[::1]/internal",
    ];

    for (const url of maliciousSsrfUrls) {
      const res = validateOfficialUrl(url);
      expect(res.isValid).toBe(false);
      expect(res.reason).toContain("blocked");
    }
  });

  it("enforces strict government-only domain filtering when requested", () => {
    const allowed = validateOfficialUrl("https://ssp.postmatric.karnataka.gov.in/", true);
    expect(allowed.isValid).toBe(true);

    const denied = validateOfficialUrl("https://evil-unverified-site.com/fake-scheme", true);
    expect(denied.isValid).toBe(false);
    expect(denied.reason).toContain("not in the approved official source registry");
  });
});
