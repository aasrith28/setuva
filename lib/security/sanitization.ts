/**
 * Text sanitization and encoding utilities
 * Compliant with SECURITY.md Section 8 (XSS prevention)
 */

export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, ""); // strip raw angle brackets
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
