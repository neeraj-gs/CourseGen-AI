'use client'
import React from 'react'
import { Form } from './ui/form'
import { z } from 'zod'
import { createChapterSchema } from '@/validators/course'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type Props = {}

type Input = z.infer<typeof createChapterSchema>//this si the shaoe of our form

const CreateCourseForm = (props: Props) => {
    const form = useForm<Input>({
        resolver: zodResolver(createChapterSchema),
        defaultValues:{
            title:'',
            units:['','','']
        }
    }) //tells react hhok formm tp have shape fo input type
  return (
    <div className='w-full'>
        <Form>
            <form></form>
        </Form>
    </div>
  )
}

export default CreateCourseForm