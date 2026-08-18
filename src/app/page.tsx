import Link from "next/link";
import DemoVideo from "@/components/landing/DemoVideo";
import HeroCull from "@/components/landing/HeroCull";
import {
  SYLLABUS,
  CHAPTERS,
  SIGNALS,
} from "@/components/landing/cutting-room-data";
import Reveal from "@/components/strip/Reveal";
import { EdgeCode, Frame, Lamp, Slate, Splice, Strip } from "@/components/strip";
import { isAppConfigured } from "@/lib/demo-mode";

const REPO_URL = "https://github.com/neeraj-gs/CourseGen-AI";

/**
 * The cut list. A real sequence — each step consumes what the one before it
 * produced — which is the only reason it is numbered.
 *
 * `state` is the honest part. Three of these run today; two are being built,
 * and saying so on the page is cheaper than being caught claiming otherwise.
 */
const CUT_LIST = [
  {
    state: "cut" as const,
    slug: "Slate",
    title: "You write the slate",
    body: "A title, then as many units as you want to cover — Basics, Advanced, whatever you decide to call them. You draw the outline; nothing guesses at what you meant by the topic.",
  },
  {
    state: "cut" as const,
    slug: "Screening",
    title: "Every chapter gets a search of its own",
    body: "The syllabus is broken into chapters, and each one gets a query written to surface a lesson rather than a trailer. That query runs against YouTube and the highest-ranked teachable result takes the slot.",
  },
  {
    state: "post" as const,
    slug: "Market intelligence",
    title: "The agent reads the room",
    body: "Rank alone is a weak signal. A market-intelligence pass will score the whole shortlist for a chapter rather than trusting first place, and the lesson that survives all four reads is the one that ends up in your course.",
    // The four things that pass reads. Listed here rather than in the hero,
    // because this is the step that performs them.
    signals: SIGNALS,
  },
  {
    state: "cut" as const,
    slug: "The cut",
    title: "Transcript in, summary out",
    body: "The winning video's transcript is pulled and condensed, so you can read a chapter in thirty seconds and decide whether to spend the hour on it.",
  },
  {
    state: "post" as const,
    slug: "The exam",
    title: "Then it asks you the questions",
    body: "The same transcript will drive concept checks and interview questions per chapter, aimed at the role you are preparing for — so finishing a chapter means answering for it, not just watching it.",
  },
];

const BENCH = [
  ["Next.js 14", "App Router, generation runs server-side"],
  ["OpenAI", "syllabus, chapter queries, summaries"],
  ["YouTube Data API", "one lookup per chapter, throttled"],
  ["Prisma + PostgreSQL", "courses, units, chapters"],
  ["NextAuth", "Google sign-in"],
  ["Stripe", "free credits, optional Pro"],
];

function StateChip({ state }: { state: "cut" | "post" }) {
  const inCut = state === "cut";
  return (
    <span
      className={
        inCut
          ? "inline-flex items-center gap-2 border border-tally/40 px-2 py-1 dark:border-teal-400/40"
          : "inline-flex items-center gap-2 border border-emulsion/40 px-2 py-1"
      }
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5"
        style={{ background: inCut ? "#0f766e" : "#c2410c" }}
      />
      <EdgeCode tone={inCut ? "tally" : "emulsion"}>
        {inCut ? "In the cut" : "In post"}
      </EdgeCode>
    </span>
  );
}

export default function Home() {
  const appLive = isAppConfigured();

  return (
    // The root layout keeps a fixed navbar and pads the body by its height.
    // Cancelling that pull lets the bench run edge to edge behind the nav,
    // which is the whole point of a sticky hero.
    <main className="cutting-room grain relative -mt-20">
      <HeroCull />

      <Splice label="Evidence" />

      {/* ---------------------------------------------------------------- */}
      {/* The rushes. The strongest thing on this page is that the product  */}
      {/* has been run, on camera, without cuts.                            */}
      {/* ---------------------------------------------------------------- */}
      <Strip>
        <section id="rushes" className="scroll-mt-28">
          <Reveal>
            <Slate scene="02" take="01" title="The rushes" />
          </Reveal>

          <Reveal delay={80}>
            <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
              <DemoVideo duration="01:22" />

              <div className="lg:pt-2">
                <p className="text-lg leading-[1.65] text-graphite/75 dark:text-lightbox/70">
                  Eighty-two seconds, one take, no edits. The prompt is{" "}
                  <em className="not-italic text-graphite dark:text-lightbox">
                    Typescript
                  </em>
                  , the units are Basics and Advanced, and everything after
                  that is the generator working — including the chapters that
                  failed and went red.
                </p>

                {!appLive && (
                  <p className="mt-5 text-[0.95rem] leading-relaxed text-graphite/60 dark:text-lightbox/50">
                    This deployment runs the recording only. Generating a
                    course needs OpenAI and YouTube keys, which are not
                    attached here —{" "}
                    <a
                      href={REPO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-splice underline-offset-4 hover:decoration-emulsion"
                    >
                      run it with your own
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </section>
      </Strip>

      <Splice label="Mechanism" />

      {/* ---------------------------------------------------------------- */}
      {/* The cut list.                                                     */}
      {/* ---------------------------------------------------------------- */}
      <Strip>
        <section>
          <Reveal>
            <Slate
              scene="03"
              take="01"
              title="What happens between typing a topic and having a course"
            />
          </Reveal>

          <ol>
            {CUT_LIST.map((step, i) => (
              <Reveal key={step.slug} delay={i * 60}>
                <Frame
                  as="li"
                  className="mb-4 grid gap-4 border-splice p-6 sm:grid-cols-[3.5rem_1fr] sm:gap-8 sm:p-8"
                >
                  <div className="flex items-center gap-4 sm:block">
                    <span className="block font-data text-[1.6rem] font-light leading-none text-dust">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="sm:hidden">
                      <StateChip state={step.state} />
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="font-display text-xl font-semibold leading-snug tracking-[-0.015em] sm:text-[1.5rem]">
                        {step.title}
                      </h3>
                      <span className="hidden sm:inline-flex">
                        <StateChip state={step.state} />
                      </span>
                    </div>
                    <p className="mt-3 max-w-2xl leading-[1.7] text-graphite/75 dark:text-lightbox/70">
                      {step.body}
                    </p>

                    {"signals" in step && step.signals ? (
                      <dl className="mt-6 max-w-2xl border-t border-splice dark:border-white/[0.09]">
                        {step.signals.map((signal) => (
                          <div
                            key={signal.label}
                            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-splice py-2.5 dark:border-white/[0.09]"
                          >
                            <dt className="w-full shrink-0 sm:w-[9.5rem]">
                              <EdgeCode tone="ink">{signal.label}</EdgeCode>
                            </dt>
                            <dd className="flex-1 text-[0.95rem] leading-relaxed text-graphite/65 dark:text-lightbox/55">
                              {signal.note}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </div>
                </Frame>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <p className="mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-graphite/60 dark:text-lightbox/50">
              Steps marked <em className="not-italic">in post</em> are being
              built and are not in the recording above. They are listed here
              because they are the next two things to ship, not because they
              already work.
            </p>
          </Reveal>
        </section>
      </Strip>

      {/* ---------------------------------------------------------------- */}
      {/* The artefact — the exact syllabus that came out of the run.       */}
      {/* ---------------------------------------------------------------- */}
      <Strip className="mt-24 sm:mt-36">
        <section>
          <Reveal>
            <Slate
              scene="04"
              take="01"
              title="One word in. Thirteen lessons out."
            />
          </Reveal>

          <Reveal delay={80}>
            <div className="grid gap-10 lg:grid-cols-[19rem_1fr] lg:gap-16">
              <div>
                <p className="text-lg leading-[1.65] text-graphite/75 dark:text-lightbox/70">
                  This is the syllabus the generator produced in the recording,
                  transcribed exactly. Four units, thirteen chapters, a video
                  and a summary behind every one of them.
                </p>

                <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-splice pt-6 dark:border-white/[0.09]">
                  {[
                    [String(SYLLABUS.length), "units"],
                    [String(CHAPTERS.length), "chapters"],
                    ["1", "prompt"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <dt className="sr-only">{label}</dt>
                      <dd>
                        <span className="block font-data text-[1.75rem] font-light leading-none text-tally dark:text-teal-400">
                          {value}
                        </span>
                        <span className="mt-2 block">
                          <EdgeCode>{label}</EdgeCode>
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* The reel: thirteen rows, one per survivor on the bench. */}
              <ol className="max-w-3xl border-t border-splice dark:border-white/[0.09]">
                {SYLLABUS.map((unit, ui) => (
                  <li
                    key={unit.title}
                    className="border-b border-splice py-6 dark:border-white/[0.09]"
                  >
                    <div className="flex items-baseline gap-4">
                      <EdgeCode>Unit {String(ui + 1).padStart(2, "0")}</EdgeCode>
                      <h3 className="font-display text-lg font-semibold tracking-[-0.01em]">
                        {unit.title}
                      </h3>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {unit.chapters.map((chapter) => (
                        <li
                          key={chapter}
                          className="flex items-baseline gap-3 text-graphite/80 dark:text-lightbox/70"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[0.45em] h-1.5 w-3 shrink-0 bg-tally dark:bg-teal-400"
                          />
                          <span>{chapter}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </section>
      </Strip>

      <Splice label="Colophon" />

      {/* ---------------------------------------------------------------- */}
      {/* The bench.                                                        */}
      {/* ---------------------------------------------------------------- */}
      <Strip>
        <section>
          <Reveal>
            <Slate scene="05" take="01" title="What it is built on" />
          </Reveal>

          <Reveal delay={60}>
            <dl className="grid gap-x-12 border-t border-splice sm:grid-cols-2 dark:border-white/[0.09]">
              {BENCH.map(([name, role]) => (
                <div
                  key={name}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-splice py-3.5 dark:border-white/[0.09]"
                >
                  <dt className="w-full shrink-0 sm:w-[12rem]">
                    <EdgeCode tone="ink">{name}</EdgeCode>
                  </dt>
                  <dd className="flex-1 text-[0.95rem] text-graphite/65 dark:text-lightbox/55">
                    {role}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 max-w-2xl leading-[1.7] text-graphite/75 dark:text-lightbox/70">
              Chapter lookups are throttled rather than fired in parallel: the
              YouTube Data API charges 100 units per search against a default
              10,000-a-day quota, which works out at roughly a hundred chapters
              a day before it starts returning 403s.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Lamp href="/create" weight="cut">
                Generate a course
              </Lamp>
              <Lamp href={REPO_URL} external>
                Read the source
              </Lamp>
            </div>
          </Reveal>
        </section>
      </Strip>

      <footer className="mt-28 border-t border-splice py-10 dark:border-white/[0.09]">
        <Strip>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <EdgeCode>CourseGenX-AI — end of reel</EdgeCode>
            <div className="flex gap-8">
              <Link
                href="/courses"
                className="text-[0.95rem] underline decoration-splice underline-offset-[6px] transition-colors hover:decoration-emulsion"
              >
                Course gallery
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="text-[0.95rem] underline decoration-splice underline-offset-[6px] transition-colors hover:decoration-emulsion"
              >
                GitHub
              </a>
            </div>
          </div>
        </Strip>
      </footer>
    </main>
  );
}
