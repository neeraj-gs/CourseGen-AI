"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Motion 2 of 4 — REGISTRATION.
 *
 * Film locates on the registration pin: it travels along the strip and stops
 * dead, with no bounce. Every section on this page arrives that way, which is
 * what makes the site read as one designed object rather than a stack of
 * separately animated components.
 *
 * The class is toggled once and the observer disconnects — there is no
 * per-frame work here at all, and reduced motion is honoured in CSS.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  /** Milliseconds. Kept small; a long stagger is a demo reel, not a page. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.add("animate-register");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-register=""
      style={{ animationDelay: delay ? `${delay}ms` : undefined }}
      className={cn("opacity-0", className)}
    >
      {children}
    </div>
  );
}
