/**
 * SSRF and URL validation protections
 * Compliant with ApplyRight SECURITY.md Section 10
 */

// Permitted official and academic domains for government scheme sources
const ALLOWED_DOMAIN_PATTERNS = [
  /\.gov\.in$/i,
  /\.nic\.in$/i,
  /\.karnataka\.gov\.in$/i,
  /\.ac\.in$/i,
  /\.edu\.in$/i,
  /^scholarships\.gov\.in$/i,
  /^karepass\.cgg\.gov\.in$/i,
  /^ssp\.postmatric\.karnataka\.gov\.in$/i,
  /^sevasindhu\.karnataka\.gov\.in$/i,
  /^applyright\.org$/i,
  /^setuva\.org$/i,
];

// Blocked IP ranges: private, loopback, link-local, cloud metadata
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./, // AWS/GCP/Azure link-local metadata
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
  /^\[?fd[0-9a-f]{2}:/i, // IPv6 ULA
  /^\[?fe80:/i, // IPv6 link-local
];

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  reason?: string;
}

/**
 * Validates that an official source URL uses HTTPS, does not resolve to private/metadata IP space,
 * and matches approved official domain patterns.
 */
export function validateOfficialUrl(rawUrl: string, strictGovOnly: boolean = false): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, reason: "Missing or invalid URL parameter." };
  }

  const trimmed = rawUrl.trim();
  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, reason: "Invalid URL syntax." };
  }

  // Only permit https
  if (parsed.protocol !== "https:") {
    return { isValid: false, reason: "Only HTTPS protocol is permitted for official sources." };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check for blocked internal / metadata hostnames or IPs
  for (const pattern of BLOCKED_HOST_PATTERNS) {
    if (pattern.test(hostname)) {
      return { isValid: false, reason: "Access to private, loopback, or metadata addresses is blocked." };
    }
  }

  // If strict domain allowlist checking is active
  if (strictGovOnly) {
    const isAllowed = ALLOWED_DOMAIN_PATTERNS.some((pattern) => pattern.test(hostname));
    if (!isAllowed) {
      return {
        isValid: false,
        reason: `Domain ${hostname} is not in the approved official source registry.`,
      };
    }
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
  };
}
