"use client"
import { Chapter, Course, Unit } from '@prisma/client'
import React, { useMemo, useState } from 'react'
import ChapterCard, { ChapterCardHandler } from './ChapterCard'
import { Separator } from './ui/separator'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
    course: Course & {
        units:(Unit & {
            chapters: Chapter[]
        })[]
    }
}

const ConfirmChapters = ({course}: Props) => {
    const [isLoading,setIsLoading] = useState(false)
    //react ref is a refrence to each compoent , we can have an array for each chapter , on clicking , we call fucntin on each card and call the functoin

    const chapterRefs:Record<string , React.RefObject<ChapterCardHandler>> = {};
    course.units.forEach(c => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        chapterRefs[c.id] = React.useRef(null)
    })

    const [completed,setCompleted] = React.useState<Set<String>>(new Set())

    const totalChapters = useMemo(()=>{ //goes thorug each unit and add cahtpers to accumulater and return final chapters
        return course.units.reduce((acc,u)=>{
            return acc+u.chapters.length
        },0);
    },[course.units])

  return (
    <div className='w-full mt-4'>
        {course.units.map((u,ui)=>{
            return(
                <div key={u.id} className='mt-5'>
                    <h3 className='text-2xl font-bold'>{u.name}</h3>
                    <div className='mt-3'>
                        {u.chapters.map((c,ci)=>{
                            return(
                                <ChapterCard completed={completed} setCompleted={setCompleted} ref={chapterRefs[c.id]} key={c.id} c={c} ci={ci} />
                            )
                        })}
                    </div>
                </div>
            )
        })}

        <div className='fkex items-center justify-center mt-5'>
            
            <div className='flex items-center mt-10 gap-4'>
                <Link href="/create" className={buttonVariants({variant:"secondary"})}>
                    <ChevronLeft className='w-4 h-4 mr-2' />
                    Back
                </Link>
                {
                    totalChapters === completed.size ? (
                        <Link href={`/course/${course.id}/0/0`} className={buttonVariants({
                            className: "ml-4 font-semibold"
                        })}>Safe and Continue
                            <ChevronRight className='w-4 h-4 ml-2' />
                        </Link>
                    ):(
                        <Button
                    disabled={isLoading}
                    onClick={()=>{
                        setIsLoading(true)
                        Object.values(chapterRefs).forEach((ref)=>{
                            ref.current?.triggerLoad();
                        }) //gives us indivitual Refs
                    }}
                type='button' className='ml-4 font-semibold hover:bg-green-500'>Generate <ChevronRight className='w-4 h-4 ml-2'/> </Button>
                    )
                }

                
            </div>
            

        </div>

    </div>
  )
}

export default ConfirmChapters