/**
 * Validates whether a string is a properly formatted URL.
 * Uses the built-in URL constructor — if it throws, the string is not a valid URL.
 */
const validateUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    // Only allow http and https protocols
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export default validateUrl;
