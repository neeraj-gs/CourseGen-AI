"use client"
import { Chapter, Course, Unit } from '@prisma/client'
import React from 'react'
import ChapterCard from './ChapterCard'
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
  return (
    <div className='w-full mt-4'>
        {course.units.map((u,ui)=>{
            return(
                <div key={u.id} className='mt-5'>
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

        <div className='fkex items-center justify-center mt-5'>
            
            <div className='flex items-center mt-10 gap-4'>
                <Link href="/create" className={buttonVariants({variant:"secondary"})}>
                    <ChevronLeft className='w-4 h-4 mr-2' />
                    Back
                </Link>

                <Button
                    onClick={()=>{}}
                type='button' className='ml-4 font-semibold hover:bg-green-500'>Generate <ChevronRight className='w-4 h-4 ml-2'/> </Button>
            </div>
            

        </div>

    </div>
  )
}

export default ConfirmChapters