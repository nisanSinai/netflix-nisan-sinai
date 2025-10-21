import fetch from "node-fetch";

const PLACEHOLDER_URL = "https://picsum.photos/seed/m/300/450";

async function validateUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" }); // only check headers
    if (response.ok) {
      return url;
    }
  } catch (err) {
    console.warn(`URL check failed for ${url}:`, err.message);
  }
  return PLACEHOLDER_URL;
}
export { validateUrl };