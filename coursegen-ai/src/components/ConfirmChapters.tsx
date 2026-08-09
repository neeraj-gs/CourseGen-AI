"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chapter, Course, Unit } from "@prisma/client";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ChapterCard, { ChapterCardHandler } from "./ChapterCard";
import { Button, buttonVariants } from "./ui/button";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

// Each chapter costs one YouTube search plus one OpenAI call. Firing them all
// at once trips provider rate limits on any course of a realistic size, so run
// a small number at a time instead.
const CONCURRENCY = 2;

const ConfirmChapters = ({ course }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // A single ref holding every chapter handler. The previous version called
  // React.useRef() inside a forEach, which breaks the rules of hooks — the hook
  // count changes with the data and React can mismatch state between renders.
  const chapterRefs = useRef(new Map<string, ChapterCardHandler>());

  const registerChapter = useCallback(
    (id: string, handler: ChapterCardHandler | null) => {
      if (handler) {
        chapterRefs.current.set(id, handler);
      } else {
        chapterRefs.current.delete(id);
      }
    },
    []
  );

  const totalChapters = useMemo(
    () => course.units.reduce((acc, u) => acc + u.chapters.length, 0),
    [course.units]
  );

  const allDone = totalChapters > 0 && completed.size === totalChapters;

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    try {
      const queue = Array.from(chapterRefs.current.values());
      const workerCount = Math.min(CONCURRENCY, queue.length);

      await Promise.all(
        Array.from({ length: workerCount }, async () => {
          while (queue.length > 0) {
            const handler = queue.shift();
            // triggerLoad never rejects — it reports failures via toast.
            await handler?.triggerLoad();
          }
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="w-full mt-4">
      {course.units.map((u, ui) => (
        <div key={u.id} className="mt-5">
          <h3 className="text-2xl font-bold">
            <span className="text-sm uppercase text-secondary-foreground/60">
              Unit {ui + 1}
            </span>
            <br />
            {u.name}
          </h3>
          <div className="mt-3">
            {u.chapters.map((c, ci) => (
              <ChapterCard
                key={c.id}
                ref={(handler) => registerChapter(c.id, handler)}
                c={c}
                ci={ci}
                completed={completed}
                setCompleted={setCompleted}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col items-center mt-10">
        {isLoading && (
          <p className="mb-4 text-sm text-secondary-foreground/60">
            Finding videos and writing summaries — {completed.size} of{" "}
            {totalChapters} done. This can take a couple of minutes.
          </p>
        )}

        <div className="flex items-center gap-4">
          <Link
            href="/create"
            className={buttonVariants({ variant: "secondary" })}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          {allDone ? (
            <Link
              href={`/course/${course.id}/0/0`}
              className={buttonVariants({ className: "font-semibold" })}
            >
              Save and Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          ) : (
            <Button
              disabled={isLoading}
              onClick={handleGenerate}
              type="button"
              className="font-semibold"
            >
              {isLoading ? (
                <>
                  Generating
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                </>
              ) : (
                <>
                  Generate
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmChapters;
