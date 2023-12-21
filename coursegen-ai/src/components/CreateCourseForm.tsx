'use client'
import React from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form'
import { z } from 'zod'
import { createChapterSchema } from '@/validators/course'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { Plus, Trash } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type Props = {}

type Input = z.infer<typeof createChapterSchema>//this si the shaoe of our form
//to create a type from zod formSchema  we need to infer a new type

const CreateCourseForm = (props: Props) => {
    const router = useRouter();

    const {mutate:createChapters} = useMutation({
        mutationFn: async({title,units}:Input)=>{
            const res = await axios.post('/api/course/createChapters',{title,units})
            return res.data;
        }
    })

    const form = useForm<Input>({
        resolver: zodResolver(createChapterSchema),
        defaultValues:{
            title:'',
            units:['','','']
        }
    }) //tells react hhok formm tp have shape fo input type

    function onSubmit(data:Input){
        if(data.units.some(u=>u==='')){
            toast.error("Units Cannot Be Empty , need a Minimum fo 3 Units")
            return
        }
        // console.log(data)
        createChapters(data,{
            onSuccess:({course_id})=>{
                toast.success("Course Createed Successfully")
                router.push(`/create/${course_id}`)
                

            },
            onError:(err)=>{
                console.log(err)
                toast.error("Cannot Create Course At this time, Try Again After Some Time")
            }
        })
    }
    // console.log(form.watch()); //it watcjes for each chagne , similar ot an onCahnge
    form.watch();


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

                {form.watch('units').map((_,i)=>{//actually take sthe first argument and the index
                    return(
                        <FormField  key={i} control={form.control} name={`units.${i}`} render={({field})=>{
                            return(
                                <FormItem className='flex flex-col items-start w-full sm:items-center sm:flex-row'>
                                <FormLabel className='flex-[1] text-xl'>Unit {i+1}</FormLabel>
                                <FormControl className='flex-[6]'>
                                    <Input placeholder='Enter the Unit' {...field}/>
                                </FormControl>
                                </FormItem>
                            )
                        }}/>
                    )
                })}

                <div className='flex items-center justify-center mt-4'>
                    <Separator className='flex-[1]'/>
                    <div className='mx-4'>
                        <Button type='button' onClick={()=>{
                            form.setValue('units',[...form.watch('units'),""]);
                        }} variant='secondary' className='font-semibold ml-4'>Add Unit <Plus className='w-4 h-4 ml-2 text-green-500'/> </Button>
                        <Button type='button' onClick={()=>{
                            form.setValue('units',form.watch('units').slice(0,-1))
                        }} variant='secondary' className='font-semibold ml-6'>Remove Unit <Trash className='w-4 h-4 ml-2 text-red-500'/> </Button>
                    </div>
                    <Separator className='flex-[1]'/>
                </div>
                <Button type='submit' className='w-full mt-6' size='lg'>Generate Your AI Course </Button>
            </form>
        </Form>
    </div>
  )
}

export default CreateCourseForm