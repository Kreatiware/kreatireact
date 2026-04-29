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
