import Image from "next/image";
import Link from "next/link";
import { Chapter, Course, Unit } from "@prisma/client";
import { PLACEHOLDER_COURSE_IMAGE } from "@/lib/constants";

type Props = {
  c: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const CourseCard = ({ c }: Props) => {
  // next/image throws on an empty src, which is what a course with no cover
  // image used to produce.
  const image = c.image || PLACEHOLDER_COURSE_IMAGE;
  // The image optimizer rejects SVG unless dangerouslyAllowSVG is enabled, so
  // serve the local placeholder as-is rather than loosening that setting.
  const isPlaceholder = image === PLACEHOLDER_COURSE_IMAGE;

  return (
    <div className="overflow-hidden border rounded-lg border-secondary">
      <Link href={`/course/${c.id}/0/0`} className="relative block">
        <Image
          src={image}
          className="object-cover w-full h-[180px]"
          width={400}
          height={180}
          unoptimized={isPlaceholder}
          alt={`Cover image for ${c.name}`}
        />
        <span className="absolute px-2 py-1 text-white rounded-md bg-black/60 bottom-2 left-2 right-2">
          {c.name}
        </span>
      </Link>

      <div className="p-4">
        <h4 className="text-sm text-secondary-foreground/60">Units</h4>
        <div className="space-y-1">
          {c.units.map((u, ui) => (
            <Link
              className="block underline w-fit"
              key={u.id}
              // Was '/courses/...', which does not resolve to a lesson page.
              href={`/course/${c.id}/${ui}/0`}
            >
              {u.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
