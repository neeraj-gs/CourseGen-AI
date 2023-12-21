import Link from 'next/link'
import React from 'react'
import SignInButton from './SignInButton'
import { getAuthSession } from '@/lib/auth'
import UserAccountNav from './UserAccountNav'
import { ThemeToggle } from './ThemeToggle'

type Props = {}

const Navbar = async (props: Props) => {
    const session = await getAuthSession() //getServer session returns the current user and thier detials
  return (
    <nav className='fixed inset-x-0 top-0 bg-white dark:bg-gray-900 z-[10] h-fit border-b border-zinc-300 py-6 shadow-lg dark:shadow-white dark:shadow-lg'>
        <div className='flex items-center justify-center h-full gap-4 px-8 mx-auto sm:justify-between max-w-7xl'>
            <Link href='/courses' className='items-center hidden gap-2 sm:flex'>
                <p className='rounded-xl border-4 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:translate-y-[2px] md:block dark:border-white' >CourseGenX-AI</p>
            </Link>
            <div className='flex items-center'>
                <Link href='/courses' className='mr-5 underline'>Courses</Link>

                {session?.user && (
                    <>
                        <Link href='/create' className='mr-5 underline'>Create Course</Link>
                        <Link href='/settings' className='mr-5 underline'>Settings</Link>
                    </>
                )}

                <ThemeToggle className='mr-5' />
                
                <div className='flex items-center'>
                    {session?.user ? <UserAccountNav user={session.user} />:<SignInButton /> }
                </div>
            </div>
            
        </div>
    </nav>
  )
}

export default Navbar