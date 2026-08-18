import Link from "next/link";
import { Chapter, Course, Unit } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  currentChapterId: string;
};

const CourseSideBar = ({ course, currentChapterId }: Props) => {
  return (
    // Stacks above the lesson on small screens; becomes a sticky rail from lg up.
    <aside className="w-full lg:w-[340px] lg:flex-shrink-0 p-6 bg-secondary lg:rounded-r-3xl lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <h1 className="text-3xl font-bold break-words">{course.name}</h1>

      {course.units.map((u, ui) => (
        <div className="mt-4" key={u.id}>
          <h2 className="text-sm uppercase text-secondary-foreground/60">
            Unit {ui + 1}
          </h2>
          <h2 className="text-2xl font-bold break-words">{u.name}</h2>

          {u.chapters.map((c, ci) => (
            <div key={c.id}>
              <Link
                href={`/course/${course.id}/${ui}/${ci}`}
                className={cn(
                  "block py-1 text-secondary-foreground/60 hover:text-secondary-foreground",
                  {
                    "text-green-500 font-bold hover:text-green-500":
                      c.id === currentChapterId,
                  }
                )}
              >
                {c.name}
              </Link>
            </div>
          ))}

          <Separator className="mt-2 bg-gray-500/40" />
        </div>
      ))}
    </aside>
  );
};

export default CourseSideBar;
