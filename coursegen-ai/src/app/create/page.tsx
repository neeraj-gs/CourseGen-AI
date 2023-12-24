//this is going to be a server componet
import CreateCourseForm from '@/components/CreateCourseForm';
import { getAuthSession } from '@/lib/auth';
import { CheckSubscription } from '@/lib/subscription';
import { InfoIcon } from 'lucide-react';
import { redirect } from 'next/navigation';

type Props = {}

const CreateCourse = async (props: Props) => {
    const session = await getAuthSession(); //getuth sesion lib utils fucntion can be sued to cjec if user exists or not
    if(!session?.user){
        return redirect('/courses')
    }
    const isPro = await CheckSubscription()
  return (
    <div className='flex flex-col items-start max-w-xl px-8 mx-auto my-36 sm:px-0'>
        <h1 className='self-center text-3xl md:text-3xl font-bold text-center sm:text-2xl'>Create Your Customized Course</h1>
        <div className='flex p-4 mt-5 border-none bg-secondary'>
            <InfoIcon className='w-12 h-12 mr-3 text-blue-300'/>
            <div>
                Enter the course title and Enter a list of units or specific topics you want to master, then our AI Model will generate the best customized course for you!!. <br />
                <br /> The Best Customized Course You want are Just a Few Clicks Ahead ! Come Master your Course With Our AI!!
            </div>
            
        </div>
        <CreateCourseForm isPro={isPro} />

    </div>
    
  )
}

export default CreateCourse