import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
  params:{
    course_id:string;
  }
};

const CreateChapters = async({params:{course_id}}:Props) => {
  const session = await getAuthSession();
  if(!session?.user){
    return redirect('/course')
  }

  const course = await prisma.course.findUnique({
    where:{
      id:course_id
    },
    include:{
      units:{
        include:{
          chapters: true //prisma way of doing joins, get all teh joins and get hte tree strucutre of all courses , units and chapters
        }
      }
    }
  })
  if(!course){
    return redirect('/create')
  }
  return (
    <div className='pt-6'></div>
  )
}

export default CreateChapters