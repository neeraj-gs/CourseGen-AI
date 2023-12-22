"use client"

import { cn } from '@/lib/utils'
import { Chapter } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

type Props = {
    c:Chapter
    ci:number
}

export type ChapterCardHandler = {
  triggerLoad: ()=>void
}

//need to send parallel request to iur server 
const ChapterCard = React.forwardRef<ChapterCardHandler,Props>(({c,ci},ref) => {
    
    const [success,setSuccess] = useState<boolean | null>(null)
    const [isLoading,setIsLoading] = useState(false)
    const {mutate:getChapterInfo} = useMutation({
      mutationFn:async()=>{
        const res = await axios.post("/api/chapter/getInfo",{chapter_id:c.id})
        return res.data //this request is blocked between random timing between 0 and 4 s
      }
    });
    React.useImperativeHandle(ref,()=>({
      async triggerLoad(){
        //as the c.id is triggerd this function is called
        getChapterInfo(undefined,{
          onSuccess:()=>{
            setSuccess(true)
          },
          onError:(err)=>{
            console.log(err)
            setSuccess(false)
            toast.error("Error Generating Your Chapters Try Again Later")
          }
        })
      }
    }))
  return (
    <div key={c.id} className={cn("px-4 py-2 mt-3 rounded flex justify-between",
    {
        "bg-secondary":success === null,
        "bg-red-500":success === false,
        "bg-green-500":success === true

    }
    )}>
        <h5>{c.name}</h5>
    </div>
  )
})

ChapterCard.displayName = "ChapterCard"

export default ChapterCard