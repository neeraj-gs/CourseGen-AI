//this is going to be a server componet
import { getAuthSession } from '@/lib/auth';
import { InfoIcon } from 'lucide-react';
import { redirect } from 'next/navigation';

type Props = {}

const CreateCourse = async (props: Props) => {
    const session = await getAuthSession();
    if(!session?.user){
        return redirect('/courses')
    }
  return (
    <div className='flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0'>
        <h1 className='self-center text-3xl md:text-3xl font-bold text-center sm:text-2xl'>Create Your Customized Course</h1>
        <div className='flex p-4 mt-5 border-none bg-secondary'>
            <InfoIcon className='w-12 h-12 mr-3 text-blue-300'/>
            <div>
                Enter the course title and Enter a list of units or specific topics you want to master, then our AI Model will generate the best customized course for you!!.
            </div>
        </div>

    </div>
    
  )
}

export default CreateCourse