import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { isAppConfigured } from "@/lib/demo-mode";
import DemoModeNotice from "@/components/DemoModeNotice";

// The gallery reads the database on every request. Without this, Next tries to
// prerender it at build time, which fails the build when no database is
// reachable and would otherwise freeze the gallery at build-time contents.
export const dynamic = "force-dynamic";

const GalleryPage = async () => {
  // No database on this deployment — show the demo notice instead of a 500.
  if (!isAppConfigured()) {
    return <DemoModeNotice feature="The course gallery" />;
  }

  const courses = await prisma.course.findMany({
    include: {
      units: {
        include: { chapters: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-24 mx-auto text-center max-w-2xl">
        <h1 className="text-3xl font-bold">No courses yet</h1>
        <p className="mt-3 text-secondary-foreground/60">
          Nobody has generated a course yet. Be the first — pick any topic and
          let the AI build the syllabus for you.
        </p>
        <Link href="/create" className={buttonVariants({ className: "mt-6" })}>
          Create a course
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Course Gallery</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {courses.map((c) => (
          <CourseCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
