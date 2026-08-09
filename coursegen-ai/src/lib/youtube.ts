import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { env } from "./env";

/**
 * Finds a lesson video for an AI-generated search query.
 *
 * Returns null instead of throwing when nothing suitable is found, so a single
 * unlucky chapter doesn't abort a whole course. Note that each call costs 100
 * units of the default 10,000/day YouTube Data API quota — roughly 100 chapters
 * per day on a default project.
 */
export async function searchYouTube(
  searchQuery: string
): Promise<string | null> {
  try {
    const { data } = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: env.YOUTUBE_API_KEY,
          q: searchQuery,
          part: "id",
          videoDuration: "medium",
          videoEmbeddable: "true",
          type: "video",
          maxResults: 5,
        },
        timeout: 10_000,
      }
    );

    const videoId = data?.items?.[0]?.id?.videoId;
    if (!videoId) {
      console.warn(`No YouTube result for query: ${searchQuery}`);
      return null;
    }
    return videoId as string;
  } catch (error: any) {
    // A 403 here almost always means the daily quota is exhausted or the API
    // key does not have the YouTube Data API v3 enabled.
    const status = error?.response?.status;
    const reason = error?.response?.data?.error?.message;
    console.error(
      `YouTube search failed${status ? ` (${status})` : ""}:`,
      reason ?? error
    );
    return null;
  }
}

/** Returns the video transcript, or an empty string when captions are unavailable. */
export async function getTranscript(videoId: string | null): Promise<string> {
  if (!videoId) return "";

  try {
    const transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
      country: "EN",
    });

    return transcript_arr
      .map((t) => t.text)
      .join(" ")
      .replaceAll("\n", " ")
      .trim();
  } catch (error) {
    // Plenty of videos simply have no captions; that is not an error worth failing on.
    return "";
  }
}
