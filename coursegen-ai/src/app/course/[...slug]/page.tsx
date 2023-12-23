// ... = maps to  mulitple routes adter the previous routes
import React from 'react'
type Props={
    params:{
        slug:string[]
    }
}

const CoursePage = ({params:{slug}}:Props) => {
  return (
    <div>CoursePage</div>
  )
}

export default CoursePage