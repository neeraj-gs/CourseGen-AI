import { Chapter, Course, Unit } from '@prisma/client'
import React from 'react'
import ChapterCard from './ChapterCard'

type Props = {
    course: Course & {
        units:(Unit & {
            chapters: Chapter[]
        })[]
    }
}

const ConfirmChapters = ({course}: Props) => {
  return (
    <div className='w-full mt-4'>
        {course.units.map((u,ui)=>{
            return(
                <div key={u.id} className='mt-5'>
                    <h2 className='text-sm uppercase text-secondary-foreground/60'>
                        Unit {ui + 1}
                    </h2>
                    <h3 className='text-2xl font-bold'>{u.name}</h3>
                    <div className='mt-3'>
                        {u.chapters.map((c,ci)=>{
                            return(
                                <ChapterCard key={c.id} c={c} ci={ci} />
                            )
                        })}
                    </div>
                </div>
            )
        })}

    </div>
  )
}

export default ConfirmChapters