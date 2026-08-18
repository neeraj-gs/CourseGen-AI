"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  CHAPTER_COUNT,
  STILL_THRESHOLD,
  pickDepth,
  survivorsAt,
} from "@/components/landing/cutting-room-data";
import LightTable from "@/components/landing/light-table/LightTable";
import type { LightTableHandle } from "@/components/landing/light-table/scene";
import { EdgeCode, Lamp, Strip } from "@/components/strip";

/**
 * THE HERO — a scrubbed timeline where the playhead is the scroll position.
 *
 * The bench is a fixed canvas; the copy is real DOM scrolling over it, so
 * every word stays selectable, crisp and readable by a screen reader. Three
 * screens pass over one continuous shot:
 *
 *   1. the claim, over a full bench of unjudged candidates
 *   2. the cull sweeping through the field
 *   3. the finished course — and the control handed to the reader
 *
 * Scroll never touches React state. The listener writes straight into the
 * scene through a ref, and the live counter is written with `textContent`,
 * so dragging the rank control re-renders nothing at all.
 */

export default function HeroCull() {
  const sectionRef = useRef<HTMLElement>(null);
  const controller = useRef<LightTableHandle | null>(null);
  const keptRef = useRef<HTMLSpanElement>(null);
  const rankRef = useRef<HTMLInputElement>(null);
  const depthRef = useRef(16);

  const pushProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    const progress =
      travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;

    controller.current?.setProgress(progress);
  }, []);

  useEffect(() => {
    depthRef.current = pickDepth();

    // Scroll normally drives the threshold to 1 by the time this control is
    // on screen, so the markup ships at 100. Under reduced motion the bench
    // is frozen part-way through instead, and the control has to say so.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const threshold = still ? STILL_THRESHOLD : 1;

    if (still && rankRef.current) {
      rankRef.current.value = String(Math.round(threshold * 100));
    }
    if (keptRef.current) {
      keptRef.current.textContent = String(
        survivorsAt(threshold, depthRef.current)
      );
    }

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        pushProgress();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    pushProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pushProgress]);

  const onRank = (event: React.ChangeEvent<HTMLInputElement>) => {
    const threshold = Number(event.currentTarget.value) / 100;
    controller.current?.setOverride(threshold);
    if (keptRef.current) {
      keptRef.current.textContent = String(
        survivorsAt(threshold, depthRef.current)
      );
    }
  };

  return (
    <section ref={sectionRef} className="relative">
      {/* The bench. Fixed behind the copy for the whole three screens, so the
          3D costs one canvas and the type never becomes a texture. */}
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <LightTable controllerRef={controller} onReady={pushProgress} />

        {/* Scrim. Its only job is keeping type legible over a lit bench, so
            it carries no colour of its own — it is the page ground at varying
            opacity. Solid through the copy, gone before the near end of the
            bench arrives, which also reads as the haze the far stock sits in. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-lightbox from-16% via-lightbox/86 via-54% to-transparent to-76% dark:from-bench dark:via-bench/62 sm:from-20% sm:via-lightbox/70 sm:via-44% sm:to-60% sm:dark:via-bench/55"
        />

        {/* The legend. Real text, because the reader has to be told what the
            three colours mean and a texture cannot tell them. */}
        <Strip className="pointer-events-none absolute inset-x-0 bottom-6">
          <ul className="inline-flex flex-wrap gap-x-6 gap-y-2 border border-splice bg-lightbox px-4 py-2.5 dark:border-white/[0.09] dark:bg-bench">
            {[
              ["#c2410c", "Screened"],
              ["#0f766e", "In the cut"],
              ["#8a8880", "Culled"],
            ].map(([swatch, label]) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-4"
                  style={{ background: swatch }}
                />
                <EdgeCode>{label}</EdgeCode>
              </li>
            ))}
          </ul>
        </Strip>
      </div>

      {/* Three screens of copy, pulled back up over the fixed bench. */}
      <div className="relative -mt-[100svh]">
        {/* ---- 1. the claim ---- */}
        <div className="flex h-[100svh] items-start pt-[9svh] sm:pt-[12svh]">
          <Strip>
            <div className="max-w-[46rem]">
              <EdgeCode tone="emulsion">CourseGenX-AI — Reel 01</EdgeCode>

              <h1 className="mt-6 font-display text-[2.3rem] font-extrabold leading-[1.0] tracking-[-0.03em] sm:text-[4.1rem]">
                Type a topic.
                <br />
                Skip the bad lessons.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-[1.6] text-graphite/80 dark:text-lightbox/75">
                It writes the syllabus, then a screening agent works through
                YouTube chapter by chapter and keeps the one lesson worth your
                hour. Everything else stays on the bench.
              </p>

              {/* Stacked full-width on a narrow screen: two buttons wrapping
                  raggedly is an accident, two stacked is a decision. */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Lamp
                  href="/create"
                  weight="cut"
                  className="justify-center sm:justify-start"
                >
                  Generate a course
                </Lamp>
                <Lamp href="#rushes" className="justify-center sm:justify-start">
                  Watch a real run
                </Lamp>
              </div>
            </div>
          </Strip>
        </div>

        {/* ---- 2. the cull ---- */}
        <div className="flex h-[100svh] items-start pt-[15svh] sm:pt-[13svh]">
          <Strip>
            <div className="ml-auto max-w-[34rem]">
              <EdgeCode tone="emulsion">The cull</EdgeCode>

              <h2 className="mt-5 font-display text-[1.9rem] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[2.9rem]">
                The bench is what you
                <br />
                never have to sit through.
              </h2>

              <p className="mt-5 text-lg leading-[1.6] text-graphite/80 dark:text-lightbox/75">
                For every chapter it drafts a query aimed at a lesson rather
                than a trailer, then throws away everything that query turned
                up except the one result worth an hour of your evening.
              </p>
            </div>
          </Strip>
        </div>

        {/* ---- 3. the reader takes the control ---- */}
        <div className="flex h-[100svh] items-start pt-[15svh] sm:pt-[13svh]">
          <Strip>
            <div className="max-w-[30rem]">
              <EdgeCode tone="tally">Your call</EdgeCode>

              <h2 className="mt-5 font-display text-[1.9rem] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[2.9rem]">
                Move the line
                <br />
                yourself.
              </h2>

              <p className="mt-5 text-lg leading-[1.65] text-graphite/75 dark:text-lightbox/70">
                Drag it left and the bench fills back up with everything the
                agent threw away. Drag it right and you are left with{" "}
                {CHAPTER_COUNT} lessons — which is the course.
              </p>

              <div className="mt-9 border border-splice bg-lightbox p-5 dark:border-white/[0.09] dark:bg-bench">
                <label
                  htmlFor="rank-threshold"
                  className="flex items-baseline justify-between gap-4"
                >
                  <EdgeCode tone="ink">Cull threshold</EdgeCode>
                  <span className="font-data text-[11px] tracking-[0.14em] text-dust">
                    <span ref={keptRef} className="text-tally dark:text-teal-400">
                      {CHAPTER_COUNT}
                    </span>{" "}
                    kept
                  </span>
                </label>

                <input
                  ref={rankRef}
                  id="rank-threshold"
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={100}
                  onChange={onRank}
                  className="rank-slider mt-4"
                  aria-describedby="rank-threshold-help"
                />

                <p
                  id="rank-threshold-help"
                  className="mt-2 text-sm leading-relaxed text-graphite/60 dark:text-lightbox/50"
                >
                  Sets how deep into each chapter&rsquo;s results the agent is
                  allowed to keep looking.
                </p>
              </div>
            </div>
          </Strip>
        </div>
      </div>
    </section>
  );
}
