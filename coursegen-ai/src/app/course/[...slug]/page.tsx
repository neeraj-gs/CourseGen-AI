// /course/[courseId]/[unitIndex]/[chapterIndex]
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CourseSideBar from "@/components/CourseSideBar";
import VideoSummary from "@/components/VideoSummary";
import { prisma } from "@/lib/db";
import { isAppConfigured } from "@/lib/demo-mode";
import DemoModeNotice from "@/components/DemoModeNotice";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    slug: string[];
  };
};

const CoursePage = async ({ params: { slug } }: Props) => {
  if (!isAppConfigured()) {
    return <DemoModeNotice feature="The course viewer" />;
  }

  const [course_id, unit_index, chapter_index] = slug;

  const course = await prisma.course.findUnique({
    where: { id: course_id },
    include: {
      units: {
        include: { chapters: true },
      },
    },
  });

  if (!course) {
    return redirect("/courses");
  }

  // A malformed URL yields NaN here, which indexes to undefined and redirects.
  const ui = Number.parseInt(unit_index, 10);
  const ci = Number.parseInt(chapter_index, 10);

  const unit = course.units[ui];
  if (!unit) {
    return redirect("/courses");
  }

  const chapter = unit.chapters[ci];
  if (!chapter) {
    return redirect("/courses");
  }

  const nextChapter = unit.chapters[ci + 1];
  const prevChapter = unit.chapters[ci - 1];

  return (
    <div className="flex flex-col lg:flex-row">
      <CourseSideBar course={course} currentChapterId={chapter.id} />

      <div className="flex-1 min-w-0 px-4 py-8 sm:px-8">
        <VideoSummary chapter={chapter} ci={ci} unit={unit} ui={ui} />

        <div className="h-px mt-8 bg-gray-500/40" />

        <div className="flex gap-4 pb-8">
          {prevChapter && (
            <Link
              href={`/course/${course.id}/${ui}/${ci - 1}`}
              className="flex mt-4 mr-auto w-fit"
            >
              <div className="flex items-center">
                <ChevronLeft className="flex-shrink-0 w-6 h-6 mr-1" />
                <div className="flex flex-col items-start">
                  <span className="text-sm text-secondary-foreground/60">
                    Previous
                  </span>
                  <span className="text-xl font-bold">{prevChapter.name}</span>
                </div>
              </div>
            </Link>
          )}

          {nextChapter && (
            <Link
              href={`/course/${course.id}/${ui}/${ci + 1}`}
              className="flex mt-4 ml-auto text-right w-fit"
            >
              <div className="flex flex-col items-end">
                <span className="text-sm text-secondary-foreground/60">
                  Next
                </span>
                <span className="text-xl font-bold">{nextChapter.name}</span>
              </div>
              <ChevronRight className="flex-shrink-0 w-6 h-6 ml-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
