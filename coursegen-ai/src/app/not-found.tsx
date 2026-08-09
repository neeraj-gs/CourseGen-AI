import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 mx-auto text-center max-w-xl">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-3 text-secondary-foreground/60">
        We couldn&apos;t find that page.
      </p>
      <Link href="/courses" className={buttonVariants({ className: "mt-6" })}>
        Browse courses
      </Link>
    </div>
  );
}
