import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const settingsUrl = process.env.NEXTAUTH_URL + `/settings`

export async function GET(){
    try {
        const session = await getAuthSession()
        if(!session?.user) return new NextResponse("Unauthorized",{status:401})

        const userSubscription = await prisma.userSubscription.findUnique({
            where:{
                userId:session.user.id
            }
        })

        //cancel during Billing Portal 
        if(userSubscription && userSubscription.stripeCustomerId){
            //already subscribed trying to manage the subscription
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer:userSubscription.stripeCustomerId,
                return_url:settingsUrl
            })
            return NextResponse.json({url:stripeSession.url})
        }

        


    } catch (error) {
        
    }
}