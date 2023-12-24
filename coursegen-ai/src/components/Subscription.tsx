"use client"

import { useSession } from "next-auth/react"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { Zap } from "lucide-react"
import { useState } from "react"
import axios from "axios"

type Props = {}

const Subscription = (props: Props) => {
    const {data} = useSession()
    const [loading,setLoading] = useState(false)
    const handleSubscribe = async () => {
        // /.hit stripe endpiint and redirect it there 
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
    <div className="flex flex-col items-center w-1/2 p-4 mx-auto mt-20 rounded-e-lg bg-secondary">
        {data?.user.credits} / 10 Free Generations
        <Progress value={data?.user.credits ? (data.user.credits/10)*100: 0} />
        <Button disabled={loading} onClick={handleSubscribe} className="mt-4 font-bold text-white trnasition bg-gradient-to-tr from-green-500 to-blue-500 hover:from-green-500  hover:to-blue-600">Upgrade to Pro<Zap className="fill-white ml-2" /> </Button>
    </div>
  )
}

export default Subscription