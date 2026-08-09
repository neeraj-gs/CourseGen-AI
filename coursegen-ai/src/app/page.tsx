import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import DemoVideo from "@/components/landing/DemoVideo";
import { Button } from "@/components/ui/button";
import { isAppConfigured } from "@/lib/demo-mode";

// Real output from the run captured in the demo recording, not invented copy.
const SAMPLE_SYLLABUS = [
  {
    unit: "Introduction to TypeScript",
    chapters: ["What is TypeScript?", "Setting up Development Environment"],
  },
  {
    unit: "TypeScript Basics",
    chapters: ["Variable Declarations", "Data Types", "Functions", "Interfaces"],
  },
  {
    unit: "Advanced Topics",
    chapters: ["Classes", "Generics", "Modules", "Decorators"],
  },
  {
    unit: "TypeScript Tools and Libraries",
    chapters: [
      "TypeScript and Angular",
      "TypeScript and React",
      "TypeScript and Node.js",
    ],
  },
];

// Labelled by the artefact each stage produces rather than 01/02/03 — the
// section eyebrows already carry the unit numbering, and two numbering systems
// on one page read as decoration.
const STEPS = [
  {
    stage: "Your input",
    title: "Name the topic and the units",
    body: "Type a subject and list the areas you want to cover. You control the outline — the AI fills it in rather than guessing what you meant.",
  },
  {
    stage: "The syllabus",
    title: "The AI writes the chapters",
    body: "Every unit is broken into chapters, and each chapter gets a search query written specifically to surface a teaching video rather than a trailer.",
  },
  {
    stage: "The lessons",
    title: "Each chapter gets a lesson",
    body: "The query runs against YouTube, the transcript is pulled from the winning video, and the model condenses it into a summary you can read first.",
  },
];

const STACK = [
  "Next.js 14",
  "TypeScript",
  "Prisma",
  "PostgreSQL",
  "NextAuth",
  "OpenAI",
  "YouTube Data API",
  "Tailwind CSS",
  "Stripe",
];

const REPO_URL = "https://github.com/neeraj-gs/CourseGen-AI";

const SectionLabel = ({ index, title }: { index: string; title: string }) => (
  <div className="flex items-baseline gap-3 mb-8">
    <span className="font-mono text-xs tracking-widest uppercase text-grass">
      Unit {index}
    </span>
    <span className="h-px flex-1 bg-rule dark:bg-white/10" />
    <h2 className="text-sm font-medium tracking-wide uppercase text-mute dark:text-white/50">
      {title}
    </h2>
  </div>
);

export default function Home() {
  const appLive = isAppConfigured();

  return (
    <main className="bg-paper text-ink dark:bg-ink dark:text-paper">
      {/* Hero — the demo is the argument, so it sits as high as it can. */}
      <section className="px-6 pt-16 pb-12 mx-auto max-w-5xl sm:pt-24">
        <p className="font-mono text-xs tracking-widest uppercase text-grass">
          AI course generator
        </p>

        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Type a topic.
          <br />
          Get the whole syllabus.
        </h1>

        <p className="max-w-2xl mt-6 text-lg leading-relaxed text-mute dark:text-white/60">
          CourseGenX-AI turns any subject into a unit-by-unit course. For every
          chapter it finds the YouTube lesson worth watching and summarises it
          first, so you know what you are about to spend an hour on.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <a href="#demo">
            <Button size="lg" className="text-white bg-grass hover:bg-moss">
              Watch the demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-md border-rule hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            <Github className="w-4 h-4" />
            Read the source
          </a>
        </div>
      </section>

      {/* The recording itself. */}
      <section id="demo" className="px-6 pb-20 mx-auto max-w-5xl scroll-mt-24">
        <DemoVideo duration="01:22" />

        {!appLive && (
          <p className="max-w-2xl mt-6 text-sm leading-relaxed text-mute dark:text-white/50">
            This deployment runs the demo only — generating a course needs
            OpenAI and YouTube API keys, which are not attached here. The
            recording above is a full, unedited run of the working app.{" "}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-grass">
              Run it yourself
            </a>{" "}
            with your own keys.
          </p>
        )}
      </section>

      {/* Numbering is real here: these three steps happen in this order. */}
      <section className="px-6 py-16 mx-auto border-t max-w-5xl border-rule dark:border-white/10">
        <SectionLabel index="01" title="How it works" />

        <ol className="grid gap-10 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.title}>
              <span className="font-mono text-xs tracking-widest uppercase text-mute dark:text-white/40">
                {step.stage}
              </span>
              <h3 className="mt-3 text-xl font-bold leading-snug">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-mute dark:text-white/60">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Signature: show the actual artefact the product makes. */}
      <section className="px-6 py-16 mx-auto border-t max-w-5xl border-rule dark:border-white/10">
        <SectionLabel index="02" title="What it produced" />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h3 className="text-2xl font-bold leading-snug">
              One prompt: &ldquo;Typescript&rdquo;.
            </h3>
            <p className="mt-3 leading-relaxed text-mute dark:text-white/60">
              Four units, thirteen chapters, and a video and summary behind
              every one. This is the exact outline generated in the recording —
              nothing here was written by hand.
            </p>

            <dl className="grid grid-cols-3 gap-4 mt-8">
              {[
                ["4", "units"],
                ["13", "chapters"],
                ["13", "videos"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block font-mono text-3xl font-medium text-grass">
                      {value}
                    </span>
                    <span className="text-sm text-mute dark:text-white/50">
                      {label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Rendered the way the app's own course sidebar renders it. */}
          <div className="p-6 border rounded-xl border-rule bg-white/70 dark:border-white/10 dark:bg-white/[0.03]">
            {SAMPLE_SYLLABUS.map((u, ui) => (
              <div key={u.unit} className={ui > 0 ? "mt-6" : undefined}>
                <p className="font-mono text-xs tracking-widest uppercase text-mute dark:text-white/40">
                  Unit {ui + 1}
                </p>
                <h4 className="mt-1 text-lg font-bold">{u.unit}</h4>
                <ul className="mt-2 space-y-1">
                  {u.chapters.map((c) => (
                    <li
                      key={c}
                      className="text-sm text-mute dark:text-white/60"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 mx-auto border-t max-w-5xl border-rule dark:border-white/10">
        <SectionLabel index="03" title="How it is built" />

        <ul className="flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <li
              key={tech}
              className="px-3 py-1.5 font-mono text-xs border rounded-full border-rule text-mute dark:border-white/15 dark:text-white/60"
            >
              {tech}
            </li>
          ))}
        </ul>

        <p className="max-w-2xl mt-6 leading-relaxed text-mute dark:text-white/60">
          Course generation runs server-side on the Next.js App Router. Chapter
          lookups are throttled rather than fired in parallel, because the
          YouTube Data API allows roughly a hundred chapters per day on a
          default quota.
        </p>
      </section>

      <footer className="px-6 py-12 mx-auto border-t max-w-5xl border-rule dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs tracking-widest uppercase text-mute dark:text-white/40">
            CourseGenX-AI
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/courses" className="hover:text-grass">
              Course gallery
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-grass"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
