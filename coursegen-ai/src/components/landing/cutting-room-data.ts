/**
 * The Cutting Room's dataset.
 *
 * Everything here comes from the recording in `public/Course.mp4` — one real
 * run of the generator against the prompt "Typescript". Nothing is invented,
 * because a landing page that shows fake output is the fastest way to look
 * like it has never been run.
 */

export type Unit = {
  title: string;
  chapters: string[];
};

/** The syllabus the generator actually produced: 4 units, 13 chapters. */
export const SYLLABUS: Unit[] = [
  {
    title: "Introduction to TypeScript",
    chapters: ["What is TypeScript?", "Setting up Development Environment"],
  },
  {
    title: "TypeScript Basics",
    chapters: ["Variable Declarations", "Data Types", "Functions", "Interfaces"],
  },
  {
    title: "Advanced Topics",
    chapters: ["Classes", "Generics", "Modules", "Decorators"],
  },
  {
    title: "TypeScript Tools and Libraries",
    chapters: [
      "TypeScript and Angular",
      "TypeScript and React",
      "TypeScript and Node.js",
    ],
  },
];

/** Flat chapter list — one column on the light table per entry. */
export const CHAPTERS: string[] = SYLLABUS.flatMap((u) => u.chapters);

export const CHAPTER_COUNT = CHAPTERS.length; // 13
export const UNIT_COUNT = SYLLABUS.length; // 4

/**
 * How many candidate videos the bench holds per chapter.
 *
 * Narrow viewports get a shallower stack — same composition, a third of the
 * geometry. This is the density drop the 60fps budget depends on.
 */
export const CANDIDATES_PER_CHAPTER = { wide: 16, narrow: 12 } as const;

/**
 * Chooses the bench depth for this device. Both the renderer and the DOM
 * readout beside it call this, so the number the reader sees and the number
 * of quads on screen can never disagree.
 */
export function pickDepth(): number {
  if (typeof window === "undefined") return CANDIDATES_PER_CHAPTER.wide;

  const roomy =
    window.matchMedia("(min-width: 820px)").matches &&
    (navigator.hardwareConcurrency ?? 8) >= 4;

  return roomy ? CANDIDATES_PER_CHAPTER.wide : CANDIDATES_PER_CHAPTER.narrow;
}

/**
 * How many candidates survive at a given cull threshold. Mirrors the shader's
 * `keepLine` exactly — if these two drift, the page starts lying.
 */
export function survivorsAt(threshold: number, perChapter: number): number {
  const keepLine = 1 - Math.min(1, Math.max(0, threshold));
  const perColumn = Math.floor(keepLine * (perChapter - 1)) + 1;
  return CHAPTER_COUNT * perColumn;
}

/**
 * The cull threshold used for the single composed frame shown to readers who
 * prefer reduced motion. Shared, because the renderer draws it and the DOM
 * readout beside it reports it — and a page whose caption disagrees with its
 * own picture is worse than one with no picture.
 */
export const STILL_THRESHOLD = 0.62;

/**
 * Deterministic PRNG. The field must be identical on the server, on the
 * client, and between reloads — a candidate that changes score on refresh
 * would make the whole cull read as decoration.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Candidate = {
  /** Index of the chapter this candidate was screened for. */
  chapter: number;
  /** 0 = best in its chapter. Only rank 0 survives the cull. */
  rank: number;
  /** Composite score the agent assigns, 0..1. Drives lift and brightness. */
  score: number;
  /** Stable per-candidate jitter, so the bench never looks like graph paper. */
  seed: number;
};

/**
 * Builds the bench: every chapter gets a column of scored candidates, sorted
 * best-first. The winner of each column is the lesson that ends up in the
 * course; everything else is what the reader never has to sit through.
 */
export function buildField(perChapter: number): Candidate[] {
  const rand = mulberry32(0x0c0ffee);
  const field: Candidate[] = [];

  for (let chapter = 0; chapter < CHAPTER_COUNT; chapter += 1) {
    const scores = Array.from({ length: perChapter }, () => rand());
    // Sorted so `rank` genuinely means rank, rather than being a lookalike
    // index the shader has to pretend to respect.
    scores.sort((a, b) => b - a);

    for (let rank = 0; rank < perChapter; rank += 1) {
      field.push({ chapter, rank, score: scores[rank], seed: rand() });
    }
  }

  return field;
}

/** Screening signals the agent reads. Wording matches what it actually does. */
export const SIGNALS = [
  { label: "Rank position", note: "where the video lands for the chapter's query" },
  { label: "Watch signals", note: "views set against how long the video runs" },
  { label: "Top comments", note: "whether the people who finished it say it taught them" },
  { label: "Captions present", note: "no transcript means no summary and no questions" },
] as const;
