import { cn } from "@/lib/utils";
import { Chapter, Course, Unit } from "@prisma/client"
import Link from "next/link";
import { Separator } from "./ui/separator";

type Props = {
    course:Course &{
        units:(Unit &{
            chapters: Chapter[];
        } )[]
    };

    currentChapterId:string;
}

const CourseSideBar = ({course,currentChapterId}: Props) => {
  return (
    <div className="w-[400px] absolute top-1/2 -translate-y-1/2 p-6 rounded-r-3xl bg-secondary">
        <h1 className="text-3xl font-bold">{course.name}</h1>
        {course.units.map((u,ui)=>{
            return(
                <div className="mt-4 " key={u.id}>
                    <h2 className="text-sm uppercase text-secondary-foreground/60 ">Unit {ui + 1}</h2>
                    <h2 className="text-2xl font-bold">{u.name}</h2>
                    {u.chapters.map((c,ci)=>{
                        return(
                            <div key={c.id}>
                                <Link href={`/course/${course.id}/${ui}/${ci}`} className={cn("text-secondary-foreground/60",{
                                    "text-green-500 font-bold": c.id === currentChapterId
                                })}>
                                    {c.name}
                                </Link>
                            </div>
                        )
                    })}
                    <Separator className="mt-2 text-gray-500 bg-gray-500" />
                </div>
            )
        })}

    </div>
  )
}

export default CourseSideBar