/**
 * Validates a URL string and returns it if safe, or an empty string if dangerous.
 * Rejects `javascript:`, `data:text/html`, and `vbscript:` protocols.
 *
 * @param url - The URL to validate
 * @returns The original URL if safe, or `""` if unsafe
 */
export const sanitizeUrl = (url: string | undefined): string => {
  if (!url) return "";
  // eslint-disable-next-line no-control-regex
  const trimmed = url.replace(/[\s\u0000-\u001F]+/g, "").toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:text/html")
  ) {
    return "";
  }
  return url;
};

/**
 * Validates a CSS color value and rejects dangerous patterns.
 * Blocks `url()`, `expression()`, `env()`, and `attr()` injections.
 *
 * @param value - The CSS value to validate
 * @returns The original value if safe, or `""` if dangerous
 */
export const sanitizeCssValue = (value: string | undefined): string => {
  if (!value) return "";
  const lower = value.toLowerCase().replace(/\s/g, "");
  if (/url\s*\(|expression\s*\(|env\s*\(|attr\s*\(/.test(lower)) return "";
  return value;
};
