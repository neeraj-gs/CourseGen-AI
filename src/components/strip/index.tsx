import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * THE STRIP — the Cutting Room's primitive library.
 *
 * The page is one length of film. Perforations run down both gutters, every
 * section is a frame between them, and every frame carries an edge code the
 * way real stock is printed along its border. Nothing on the landing page
 * invents its own box; it composes these.
 */

/* -------------------------------------------------------------------------- */
/* Strip — the perforated shell every section sits inside.                    */
/* -------------------------------------------------------------------------- */

export function Strip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[1360px]", className)}>
      {/* Sprocket gutters. Decoration in the strictest sense — they tell the
          reader nothing, so they are hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="perf absolute inset-y-0 left-0 hidden w-[22px] sm:block"
      />
      <div
        aria-hidden="true"
        className="perf absolute inset-y-0 right-0 hidden w-[22px] sm:block"
      />
      <div className="px-5 sm:px-[46px]">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EdgeCode — the mono marking printed along the film's border.               */
/* -------------------------------------------------------------------------- */

export function EdgeCode({
  children,
  tone = "dust",
  className,
}: {
  children: React.ReactNode;
  tone?: "dust" | "emulsion" | "tally" | "ink";
  className?: string;
}) {
  const tones = {
    dust: "text-dust",
    emulsion: "text-emulsion",
    tally: "text-tally dark:text-teal-400",
    ink: "text-graphite dark:text-lightbox",
  };

  return (
    <span
      className={cn(
        "font-data text-[10px] font-light uppercase tracking-[0.22em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Frame — a content aperture. The Cutting Room's only container.             */
/* -------------------------------------------------------------------------- */

export function Frame({
  children,
  code,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Edge code printed on the frame's top border, e.g. "KS-04". */
  code?: string;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  return (
    <Tag
      className={cn(
        "relative border border-splice dark:border-white/[0.09]",
        className
      )}
    >
      {code ? (
        <span className="absolute -top-[7px] left-4 bg-lightbox px-2 dark:bg-bench">
          <EdgeCode>{code}</EdgeCode>
        </span>
      ) : null}
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* Slate — the section header, set out like a clapperboard.                   */
/*                                                                            */
/* The numbering is a real sequence: these sections are shot in this order    */
/* and read in this order. Where that stops being true, the slate goes.       */
/* -------------------------------------------------------------------------- */

export function Slate({
  scene,
  take,
  title,
  className,
}: {
  scene: string;
  take: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 sm:mb-14", className)}>
      <div className="inline-flex divide-x divide-splice border border-splice dark:divide-white/[0.09] dark:border-white/[0.09]">
        <span className="px-3 py-1.5">
          <EdgeCode>Scene</EdgeCode> <EdgeCode tone="ink">{scene}</EdgeCode>
        </span>
        <span className="px-3 py-1.5">
          <EdgeCode>Take</EdgeCode> <EdgeCode tone="ink">{take}</EdgeCode>
        </span>
      </div>

      <h2 className="mt-5 max-w-3xl font-display text-[1.75rem] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[2.6rem]">
        {title}
      </h2>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Splice — the physical join between two different kinds of thing.           */
/*                                                                            */
/* Used where the material genuinely changes: argument → evidence →           */
/* mechanism → what is not built yet. Nowhere else.                           */
/* -------------------------------------------------------------------------- */

export function Splice({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-4 py-14 sm:py-20"
      role="separator"
      aria-label={label}
    >
      <span className="h-px flex-1 bg-splice dark:bg-white/[0.09]" />
      <span
        aria-hidden="true"
        className="hidden h-[9px] w-16 -skew-x-[38deg] border-x border-graphite/35 dark:border-white/20 sm:block"
      />
      <EdgeCode>{label}</EdgeCode>
      <span
        aria-hidden="true"
        className="hidden h-[9px] w-16 -skew-x-[38deg] border-x border-graphite/35 dark:border-white/20 sm:block"
      />
      <span className="h-px flex-1 bg-splice dark:bg-white/[0.09]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Lamp — the only button on this page. Lit from beneath, never recoloured.   */
/* -------------------------------------------------------------------------- */

type LampProps = {
  children: React.ReactNode;
  href: string;
  /** `cut` is the single primary action per screen; `bench` is everything else. */
  weight?: "cut" | "bench";
  external?: boolean;
  className?: string;
};

export function Lamp({
  children,
  href,
  weight = "bench",
  external,
  className,
}: LampProps) {
  const isCut = weight === "cut";

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      style={
        {
          "--lamp-colour": isCut
            ? "rgba(255,255,255,0.30)"
            : "rgba(194,65,12,0.22)",
        } as React.CSSProperties
      }
      className={cn(
        "lamp-surface inline-flex items-center gap-3 border px-6 py-3.5",
        "font-data text-[11px] font-medium uppercase tracking-[0.18em]",
        "transition-transform duration-150 active:translate-y-px",
        // Both weights are opaque plates. A transparent secondary button is
        // unreadable the moment it sits over the bench, which is exactly
        // where the hero puts it.
        isCut
          ? "border-emulsion bg-emulsion text-lightbox"
          : "border-graphite/25 bg-lightbox text-graphite dark:border-white/20 dark:bg-bench dark:text-lightbox",
        className
      )}
    >
      {children}
    </a>
  );
}
