"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import axios from "axios"

type Props = {
    isPro: boolean
}

const SubsCriptionButton = ({isPro}: Props) => {
    const [loading,setLoading] = useState(false)
    const handleSubscribe = async()=>{
        setLoading(true)
        try {
            const res = await axios.get('/api/stripe')
            window.location.href = res.data.url
        } catch (error) {
            console.log(error)
            
        }finally{
            setLoading(false)
        }
    }
  return (
    <Button className="mt-4" disabled={loading} onClick={handleSubscribe}>
        {isPro ? "Manage Subscriptions":"Upgrade"}
    </Button>
  )
}

export default SubsCriptionButton