import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const session = await getAuthSession()
        if(!session?.user) return new NextResponse("Unauthorized",{status:401})
    } catch (error) {
        
    }
}