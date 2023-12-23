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
        typewriter.typeString("Integrated With AI")
        .pauseFor(2000).deleteAll()
        .typeString("Can Autocomplete Your Notes")
        .pauseFor(2000).deleteAll()
        .typeString("SuperCharged and Increased Productivity")
        .pauseFor(2000).deleteAll()
        .start()
      }}
    />
  )
}

export default TypeWriterTitle