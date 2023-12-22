"use client"

import { cn } from '@/lib/utils'
import { Chapter } from '@prisma/client'
import React, { useState } from 'react'

type Props = {
    c:Chapter
    ci:number
}

const ChapterCard = ({c,ci}: Props) => {
    const [success,setSuccess] = useState<boolean | null>(null)
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
}

export default ChapterCard