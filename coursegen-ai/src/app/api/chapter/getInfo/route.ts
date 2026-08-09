// POST /api/chapter/getInfo
//
// For a single chapter: finds a YouTube video for the AI-generated search query,
// pulls its transcript, and summarises it. Called once per chapter from the
// confirm-chapters screen.

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { getTranscript, searchYouTube } from "@/lib/youtube";
import { getAuthSession } from "@/lib/auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const bodyParser = z.object({
  chapter_id: z.string(),
});

/** Column is TEXT, but keep summaries bounded so one runaway response can't bloat rows. */
const MAX_SUMMARY_LENGTH = 3000;
/** Words of transcript fed to the model. Enough for a 200-word summary. */
const MAX_TRANSCRIPT_WORDS = 500;

export async function POST(req: Request) {
  try {
    // This endpoint spends OpenAI and YouTube quota, so it must not be open.
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { chapter_id } = bodyParser.parse(body);

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapter_id },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Already generated — nothing to do. Makes retries cheap and idempotent.
    if (chapter.videoId && chapter.summary) {
      return NextResponse.json({ success: true, cached: true });
    }

    const videoId = await searchYouTube(chapter.youtubeSearchQuery);
    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No YouTube video found for this chapter. The daily YouTube API quota may be exhausted.",
        },
        { status: 502 }
      );
    }

    const rawTranscript = await getTranscript(videoId);
    const transcript = rawTranscript
      .split(" ")
      .slice(0, MAX_TRANSCRIPT_WORDS)
      .join(" ");

    // Videos without captions still get a usable chapter — just a weaker summary
    // derived from the title instead of a missing one.
    const summarySource = transcript
      ? `Summarise this transcript in 200 words or less. Do not mention sponsors or anything unrelated to the main topic, and do not introduce what the summary is about.\n\n${transcript}`
      : `No transcript is available for this video. Write a 200-word overview of what a learner should expect from a lesson titled "${chapter.name}".`;

    const { summary }: { summary: string } = await strict_output(
      "You are an AI that is capable of summarizing a youtube transcript.",
      summarySource,
      { summary: "Summary of the transcript" }
    );

    await prisma.chapter.update({
      where: { id: chapter_id },
      data: {
        videoId,
        summary: (summary ?? "").slice(0, MAX_SUMMARY_LENGTH),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid body" },
        { status: 400 }
      );
    }

    console.error("getInfo failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
