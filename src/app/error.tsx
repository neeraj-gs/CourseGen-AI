"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 mx-auto text-center max-w-xl">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-secondary-foreground/60">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-3 mt-6">
        <Button onClick={reset}>Try again</Button>
        <Link href="/courses" className={buttonVariants({ variant: "secondary" })}>
          Back to courses
        </Link>
      </div>
    </div>
  );
}
