// ... = maps to  mulitple routes adter the previous routes
import CourseSideBar from '@/components/CourseSideBar'
import VideoSummary from '@/components/VideoSummary'
import { prisma } from '@/lib/db'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
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

  const nextChapter = unit.chapters[ci +1];
  const prevChapter = unit.chapters[ci - 1];


  return (
    <div>
      <CourseSideBar course={course} currentChapterId={chapter.id} />
      <div>
        <div className='ml-[400px] px-8'>
          <div className='flex'>
            <VideoSummary chapter={chapter} ci={ci} unit={unit} ui={ui} />
          </div>
          <div className='flex-[1] h-[1px] mt-4 text-gray-500 bg-gray-500' />
          <div className='flex pb-8'>
            {prevChapter && (
              <Link href={`/course/${course.id}/${ui}/${ci-1}`} className='flex mt-4 mr-auto w-fit'>
                <div className='flex items-center'>
                  <ChevronLeft className='w-6 h-6 mr-1' />
                  <div className='flex flex-col items-start'>
                    <span className='text-sm text-secondary-foreground/60'>
                      Previous
                    </span>
                    <span className='text-xl font-bold'>{prevChapter.name}</span>
                  </div>
                </div>
              </Link>
            )}

{nextChapter && (
              <Link href={`/course/${course.id}/${ui}/${ci+1}`} className='flex mt-4 ml-auto w-fit'>
                <div className='flex items-center'>
                  
                  <div className='flex flex-col items-start'>
                    <span className='text-sm text-secondary-foreground/60'>
                      Next
                    </span>
                    <span className='text-xl font-bold'>{nextChapter.name}</span>
                    
                  </div>
                  
                </div>
                <ChevronRight className='w-6 h-6 mr-1' />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
    
  )
}

export default CoursePage