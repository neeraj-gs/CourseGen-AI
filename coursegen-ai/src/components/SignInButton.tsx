'use client'
import React from 'react'
import { Button } from './ui/button'
import { signIn } from 'next-auth/react'

type Props = {}

const SignInButton = (props: Props) => {
  return (
    <Button variant='ghost' onClick={()=>{
        signIn('google') //sign in is a next-auth fucntion taht usign thwoch we want to sign in
    }}>Sign In</Button>
  )
}

export default SignInButton