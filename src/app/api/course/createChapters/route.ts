// POST /api/course/createChapters
//
// Takes a course title plus a list of units and asks the AI to break each unit
// into chapters, each with a YouTube search query. Persists the resulting
// Course > Unit > Chapter tree and returns the new course id.

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createChapterSchema } from "@/validators/course";
import { strict_output } from "@/lib/gpt";
import { getUnsplashImage } from "@/lib/unsplash";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { CheckSubscription } from "@/lib/subscription";

// This route calls OpenAI several times; the default 10s Vercel limit is not
// enough. 60s is the maximum on Hobby, 300s is available on Pro.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type OutputUnits = {
  title: string;
  chapters: {
    youtube_search_query: string;
    chapter_title: string;
  }[];
}[];

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPro = await CheckSubscription();
    if (session.user.credits <= 0 && !isPro) {
      return NextResponse.json(
        { error: "You have no credits left. Upgrade to Pro for unlimited courses." },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { title, units } = createChapterSchema.parse(body);

    // Both calls are independent, so run them together rather than back to back.
    const [output_units, imageSearchTerm] = await Promise.all([
      strict_output(
        `You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant youtube videos for each chapter. ` +
          `You must return exactly ${units.length} units, one for each input element, in the same order.`,
        // One prompt per unit the user actually typed. The previous version sent
        // the same generic prompt N times, so the units the user entered were
        // never passed to the model at all.
        units.map(
          (unit) =>
            `It is your responsibility to create a course about ${title}. The user has requested to create chapters for the unit "${unit}". Use "${unit}" as the unit title. For each chapter provide a detailed youtube search query that can be used to find an informative educational video. Each query should surface an educational, informative video on YouTube.`
        ),
        {
          title: "title of the unit",
          chapters:
            "an array of chapters, each chapter should have a youtube_search_query and a name for the chapter generated as chapter_title key in the JSON object",
        }
      ) as Promise<OutputUnits>,
      strict_output(
        "You are an AI capable of finding the most relevant image for a course based on the user's prompt.",
        `Provide a good image search term for a course titled "${title}". This term will be fed into the Unsplash API, so keep it short and closely relevant.`,
        {
          image_search_term:
            "a good and closely relevant search term for the title of the course",
        }
      ),
    ]);

    const validUnits = normaliseUnits(output_units);
    if (validUnits.length === 0) {
      return NextResponse.json(
        { error: "The AI could not generate chapters for this topic. Try a different title." },
        { status: 502 }
      );
    }

    const course_image = await getUnsplashImage(
      imageSearchTerm?.image_search_term ?? title
    );

    // One transaction so a partially-written course can never be left behind.
    const course = await prisma.$transaction(async (tx) => {
      const created = await tx.course.create({
        data: {
          name: title,
          image: course_image,
          userId: session.user.id,
        },
      });

      for (const unit of validUnits) {
        const prismaUnit = await tx.unit.create({
          data: {
            name: unit.title,
            courseId: created.id,
          },
        });

        await tx.chapter.createMany({
          data: unit.chapters.map((c) => ({
            name: c.chapter_title,
            youtubeSearchQuery: c.youtube_search_query,
            unitId: prismaUnit.id,
          })),
        });
      }

      // Pro users generate for free, so only free users pay a credit.
      if (!isPro) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: 1 } },
        });
      }

      return created;
    });

    return NextResponse.json({ course_id: course.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 }
      );
    }

    // Previously this branch returned nothing, which made Next.js throw
    // "No response is returned from route handler" and surfaced as an opaque
    // 500 with no message on the client.
    console.error("createChapters failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong generating your course.",
      },
      { status: 500 }
    );
  }
}

/** Drops anything the model returned that isn't a usable unit + chapter list. */
function normaliseUnits(raw: unknown): OutputUnits {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (unit): unit is OutputUnits[number] =>
        Boolean(unit) &&
        typeof unit.title === "string" &&
        Array.isArray(unit.chapters)
    )
    .map((unit) => ({
      title: unit.title,
      chapters: unit.chapters.filter(
        (c) =>
          Boolean(c) &&
          typeof c.chapter_title === "string" &&
          typeof c.youtube_search_query === "string"
      ),
    }))
    .filter((unit) => unit.chapters.length > 0);
}
