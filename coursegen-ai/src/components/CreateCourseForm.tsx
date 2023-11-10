'use client'
import React from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form'
import { z } from 'zod'
import { createChapterSchema } from '@/validators/course'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from './ui/input'

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

    function onSubmit(data:Input){
        console.log(data)
    }
    console.log(form.watch());


  return (
    <div className='w-full'>
        <Form {...form}>
            <form className='w-full mt-4' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField control={form.control} name='title' render={({field})=>{
                    return(
                        <FormItem className='flex flex-col items-start w-full sm:items-center sm:flex-row'>
                        <FormLabel className='flex-[1] text-xl'>Title</FormLabel>
                        <FormControl className='flex-[6]'>
                            <Input placeholder='Enter the Title of the Course' {...field}/>
                        </FormControl>
                    </FormItem>
                    )
                }}/>
            </form>
        </Form>
    </div>
  )
}

export default CreateCourseForm