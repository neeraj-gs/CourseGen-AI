"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The navbar shell.
 *
 * The landing page is a single continuous shot with the light table running
 * edge to edge behind it, so the bar there has to be a hairline over the
 * bench rather than an opaque block sitting on top of it. Every other route
 * keeps exactly the chrome it had — this component changes the frame, never
 * the links inside it.
 */
export default function NavChrome({ children }: { children: React.ReactNode }) {
  const onLanding = usePathname() === "/";

  return (
    <nav
      data-chrome={onLanding ? "bench" : "app"}
      className={cn(
        "fixed inset-x-0 top-0 z-10 h-fit border-b py-4",
        // Opaque on purpose. A translucent bar would be legible over the
        // bench and illegible over the copy that scrolls under it later.
        onLanding
          ? "border-splice bg-lightbox dark:border-white/[0.09] dark:bg-bench"
          : "border-rule bg-paper dark:border-white/10 dark:bg-ink"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-full items-center justify-between gap-4",
          onLanding
            ? "w-full max-w-[1360px] px-5 sm:px-[46px]"
            : "max-w-7xl px-6"
        )}
      >
        {children}
      </div>
    </nav>
  );
}
