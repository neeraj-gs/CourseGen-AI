'use client'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { User } from 'next-auth'

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
                {user?.name && (<p className='font-medium'>{user.name}</p>)}
                {user?.email && (<p className='w-[200px] truncate text-sm text-secondary-foreground'>{user.email}</p>)}
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav