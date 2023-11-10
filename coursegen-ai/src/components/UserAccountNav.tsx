'use client'
import { User } from 'next-auth'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

type Props = {
    user: User //user is from sessoin so we import user from next autha dn not our prisma claint
}

const UserAccountNav = ({user}: Props) => {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
            <div className='flex items-center justify-start gap-2 p-2'>
                <div className='flex flex-col space-y-1 leading-none'>
                {user?.name && (<p className='font-medium'>{user.name}</p>)}
                {user?.email && (<p className='w-[200px] truncate text-sm text-secondary-foreground'>{user.email}</p>)}
                </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-red-600 cursor-pointer' onSelect={()=>{
                signOut();
            }} >
                Sign Out
                <LogOut className='w-4 h-4 ml-2' />
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav