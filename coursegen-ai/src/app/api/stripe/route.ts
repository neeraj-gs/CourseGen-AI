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

        //frst time users subscription
        const stripeSession = await stripe.checkout.sessions.create({
            success_url:settingsUrl,
            cancel_url:settingsUrl,
            payment_method_types:['card'],
            mode:'subscription',
            billing_address_collection:'auto',
            customer_email:session.user.email ?? '',
            line_items:[
                {
                    price_data:{
                        currency:'USD',
                        product_data:{
                            name:"CourseGenX-AI Pro",
                            description:"Get Unlimited COurse Generations After Subscription"
                        },
                        unit_amount:1000,
                        recurring:{
                            interval:'month'
                        }
                    },
                    quantity:1 //alow to buy one subscription at a time
                }
            ],
            metadata:{
                userId:session.user.id
            }, //stripe after payment stripe sends a webhhok to our api wih user sid , so we can create sbscriptin and upgrade tehir account

        })
        return NextResponse.json({url:stripeSession.url})

        


    } catch (error) {
        console.log(error)
        return new NextResponse("INternal Server Error",{status:500})
    }
}