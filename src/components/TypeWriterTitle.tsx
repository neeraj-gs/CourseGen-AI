"use client"
import React from 'react'
import Typewriter from 'typewriter-effect'

type Props = {}

const TypeWriterTitle = (props: Props) => {
  return (
    <Typewriter
      options={{
        loop: true,
      }}
      onInit={(typewriter)=>{
        typewriter.typeString("Cannot Afford to Buy Courses?")
        .pauseFor(2000).deleteAll()
        .typeString("No Worries , Generate your Own Customized Course With Our AI")
        .pauseFor(2000).deleteAll()
        .typeString("Learn Anything You Want With Just a Few Clicks For Free")
        .pauseFor(2000).deleteAll()
        .start()
      }}
    />
  )
}

export default TypeWriterTitle