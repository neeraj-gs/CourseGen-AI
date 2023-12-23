"use client"

import { cn } from '@/lib/utils'
import { Chapter } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type Props = {
    c:Chapter
    ci:number
    completed:Set<String>
    setCompleted:React.Dispatch<React.SetStateAction<Set<String>>>
}

export type ChapterCardHandler = {
  triggerLoad: ()=>void
}

//need to send parallel request to iur server 
const ChapterCard = React.forwardRef<ChapterCardHandler,Props>(({c,ci,completed,setCompleted},ref) => {
    
    const [success,setSuccess] = useState<boolean | null>(null)
    const [isLoading,setIsLoading] = useState(false)
    const {mutate:getChapterInfo} = useMutation({
      mutationFn:async()=>{
        const res = await axios.post("/api/chapter/getInfo",{chapter_id:c.id})
        return res.data //this request is blocked between random timing between 0 and 4 s
      }
    });

    const addChapterIdToSet = useCallback(()=>{
    setCompleted((prev)=>{
      const newSet = new Set(prev);
      newSet.add(c.id)
      return newSet;
    })

    },[c.id,setCompleted])

    React.useEffect(()=>{
      if(c.videoId){
        setSuccess(true);
        addChapterIdToSet();
      }
    },[c,addChapterIdToSet])

    React.useImperativeHandle(ref,()=>({
      async triggerLoad(){
        //as the c.id is triggerd this function is called
        if(c.videoId){
          addChapterIdToSet();
          return;
        }
        getChapterInfo(undefined,{
          onSuccess:()=>{
            setSuccess(true)
            addChapterIdToSet();
          },
          onError:(err)=>{
            console.log(err)
            setSuccess(false)
            toast.error("Error Generating Your Chapters Try Again Later")
            addChapterIdToSet();
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
        {isLoading && <Loader2 className='animate-spin' />}
    </div>
  )
})

ChapterCard.displayName = "ChapterCard"

export default ChapterCard