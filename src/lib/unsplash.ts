import axios from "axios";
import { env } from "./env";
import { PLACEHOLDER_COURSE_IMAGE } from "./constants";

/**
 * Finds a cover image for a course. Never throws — a missing cover should not
 * fail a course generation the user already spent a credit on, so every failure
 * path falls back to the bundled placeholder.
 */
export async function getUnsplashImage(query: string): Promise<string> {
  if (!env.UNSPLASH_API_KEY) {
    return PLACEHOLDER_COURSE_IMAGE;
  }

  try {
    const { data } = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        per_page: 1,
        query,
        client_id: env.UNSPLASH_API_KEY,
      },
      timeout: 10_000,
    });

    const urls = data?.results?.[0]?.urls;
    if (!urls) {
      return PLACEHOLDER_COURSE_IMAGE;
    }

    // `small_s3` is an undocumented field that is not always present.
    return urls.small_s3 ?? urls.regular ?? urls.small ?? PLACEHOLDER_COURSE_IMAGE;
  } catch (error) {
    console.error("Unsplash lookup failed:", error);
    return PLACEHOLDER_COURSE_IMAGE;
  }
}
