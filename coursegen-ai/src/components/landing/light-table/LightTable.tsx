"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { pickDepth } from "@/components/landing/cutting-room-data";
import type { LightTableHandle } from "./scene";
import StaticLightTable from "./StaticLightTable";

/**
 * The lazy boundary in front of the signature.
 *
 * three.js is reached only through the `import("./scene")` below, which runs
 * inside an effect. Nothing three-shaped is imported at module scope — the
 * type import above is erased at compile time — so the renderer lands in its
 * own chunk and a visitor who never mounts this component never fetches it.
 */

function hasWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (probe.getContext("webgl2") || probe.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function LightTable({
  controllerRef,
  onReady,
}: {
  /** Filled once the scene is live; the hero drives it through this. */
  controllerRef: MutableRefObject<LightTableHandle | null>;
  /** Lets the hero push the current scroll position in, in case the reader
   *  arrived part-way down the page and never scrolled after the load. */
  onReady?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = hasWebGL();
    setSupported(ok);
    if (!ok) return;

    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let handle: LightTableHandle | null = null;
    let cleanup: (() => void) | null = null;
    let cancelled = false;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("./scene").then(({ createLightTable }) => {
      if (cancelled) return;

      handle = createLightTable({
        canvas,
        // Geometry density is a device decision, not a design one: a narrow
        // viewport or a four-thread machine gets a shallower bench — the same
        // composition at well under half the vertex load.
        perChapter: pickDepth(),
        dark: document.documentElement.classList.contains("dark"),
        still,
      });
      controllerRef.current = handle;
      onReady?.();

      // Pointer parallax. Read straight off the event and handed to a ref
      // inside the scene — this never becomes a React render.
      const onPointer = (event: PointerEvent) => {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        handle?.setPointer(
          (event.clientX / w) * 2 - 1,
          (event.clientY / h) * 2 - 1
        );
      };
      if (!still) window.addEventListener("pointermove", onPointer, { passive: true });

      // The loop stops the moment the bench leaves the viewport or the tab
      // goes to the background.
      const io = new IntersectionObserver(
        ([entry]) => handle?.setRunning(entry.isIntersecting && !document.hidden),
        { threshold: 0 }
      );
      io.observe(host);

      const onVisibility = () => handle?.setRunning(!document.hidden);
      document.addEventListener("visibilitychange", onVisibility);

      // next-themes swaps a class on <html>; the bench follows it.
      const themeObserver = new MutationObserver(() =>
        handle?.setTheme(document.documentElement.classList.contains("dark"))
      );
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      cleanup = () => {
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVisibility);
        themeObserver.disconnect();
        io.disconnect();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
      handle?.dispose();
      controllerRef.current = null;
    };
  }, [controllerRef, onReady]);

  return (
    <div ref={hostRef} className="absolute inset-0">
      {supported === false ? (
        <StaticLightTable />
      ) : (
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          // The canvas carries no information a reader needs; the counts,
          // labels and legend beside it are real DOM text.
          aria-hidden="true"
        />
      )}
    </div>
  );
}
