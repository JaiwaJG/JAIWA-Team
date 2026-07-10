/**
 * XSS Input Sanitizer Utility
 *
 * Recursively escapes HTML-special characters in request inputs
 * to mitigate reflected and stored XSS attacks.
 *
 * This utility escapes the following characters:
 *   & -> &amp;
 *   < -> &lt;
 *   > -> &gt;
 *   " -> &quot;
 *   ' -> &#x27;
 *   / -> &#x2F;
 *
 * OWASP Top 10 relevance: A03:2021 – Injection (XSS)
 */

/**
 * Escapes HTML-special characters in a single string value.
 *
 * @param {string} value - Raw input string
 * @returns {string} Escaped string
 */
const escapeHtml = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Recursively sanitizes an input value.
 *
 * @param {*} value - Any value: string, object, array, number, boolean, null
 * @returns {*} Sanitized value with the same structure
 */
const sanitize = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return escapeHtml(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (typeof value === "object") {
    const sanitized = {};
    for (const key of Object.keys(value)) {
      sanitized[key] = sanitize(value[key]);
    }
    return sanitized;
  }

  // Numbers, booleans, and other primitives are returned as-is
  return value;
};

module.exports = {
  escapeHtml,
  sanitize,
};
