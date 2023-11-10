import Link from 'next/link'
import React from 'react'

type Props = {}

const Navbar = (props: Props) => {
  return (
    <nav className='fixed inset-x-0 top-0 bg-white dark:bg-gray-900 z-[10] h-fit border-b border-zinc-300 py-2'>
        <div className='flex items-center justify-center h-full gap-2 px-8 mx-auto sm:justify-between max-w-7xl'>
            <Link href='/courses' className='items-center hidden gap-2 sm:flex'>
                <p className='rounded-xl border-4 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:translate-y-[2px] md:block dark:border-white' >CourseGenX-AI</p></Link>
            
        </div>
    </nav>
  )
}

export default Navbar