import { Chapter, Course, Unit } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

type Props = {
    c:Course & {
        units:(Unit & {
            chapters:Chapter[]
        })[]
    }
}

const CourseCard = async({c}: Props) => {
  return (
    <>
        <div className="border rounded-lg border-secondary">
            <div className="relative">
                <Link href={`/course/${c.id}/0/0`} className="relative block w-fit">
                    <Image src={c.image || ''} className="object-cover w-full max-h-[300px] rounded-t-lg" width={300} height={300} alt="Course Image" />
                    <span className="absolute px-2 py-1 text-white rounded-md bg-black/60 w-fit bottom-2 left-2 right-2">{c.name}</span>
                </Link>
            </div>

            <div className="p-4">
                <h4 className="text-sm text-secondary-foreground/60">Units</h4>
                <div className="space-y-1">{c.units.map((u,ui)=>{
                    return(
                        <Link className="block underline w-fit" key={u.id} href={`/courses/${c.id}/${ui}/0`}>{u.name}</Link>
                    )
                })}</div>
            </div>
        </div>
    </>
  )
}

export default CourseCard