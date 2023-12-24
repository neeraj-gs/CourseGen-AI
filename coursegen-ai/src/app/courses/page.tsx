import CourseCard from "@/components/CourseCard"
import { prisma } from "@/lib/db"

type Props = {}

const GalleryPage = async(props: Props) => {
    const courses = await prisma.course.findMany({
        include:{
            units:{
                include: {chapters:true}
            }
        }
    })
  return (
    <div className="py-8 mx-auto max-w-7xl"> 
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center">
            {courses.map((c)=>{
                return(
                    <CourseCard key={c.id} c={c} />
                )
            })}
        </div>
        
    </div>
  )
}

export default GalleryPage