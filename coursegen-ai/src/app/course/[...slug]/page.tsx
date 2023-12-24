// ... = maps to  mulitple routes adter the previous routes
import CourseSideBar from '@/components/CourseSideBar'
import VideoSummary from '@/components/VideoSummary'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'
type Props={
    params:{
        slug:string[]
    }
}

const CoursePage = async({params:{slug}}:Props) => {
  const [course_id,unit_index,chapter_index] = slug;

  const course = await prisma.course.findUnique({
    where:{
      id:course_id
    },
    include:{
      units:{
        include:{chapters:true}
      }
    }
  })

  if(!course){
    return redirect('/courses')
  }
  let ui = parseInt(unit_index);
  let ci = parseInt(chapter_index);

  const unit = course.units[ui]
  if(!unit){
    return redirect('/courses')
  }

  const chapter = unit.chapters[ci];
  if(!chapter){
    return redirect('/courses')
  }


  return (
    <div>
      <CourseSideBar course={course} currentChapterId={chapter.id} />
      <div>
        <div className='ml-[400px] px-8'>
          <div className='flex'>
            <VideoSummary chapter={chapter} ci={ci} unit={unit} ui={ui} />
          </div>
        </div>
      </div>
    </div>
    
  )
}

export default CoursePage