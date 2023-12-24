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
        </div>
    </>
  )
}

export default CourseCard