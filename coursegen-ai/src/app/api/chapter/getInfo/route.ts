// /api/chapter/getInfo 

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
    chapter_id:z.string()
})
//just wait for random timing between 0 to 4 s

export async function POST(req:Request,res:Response){
    try {
        const body = await req.json()
        const {chapter_id} = bodyParser.parse(body)
        const chapter = await prisma.chapter.findUnique({
            where:{
                id: chapter_id
            }
        })
        if(!chapter){
            return NextResponse.json({success:false,error:"Chapter Not Found"},{status:404})
        }


        
        
    } catch (error) {
        if(error instanceof z.ZodError){
            return NextResponse.json({
                success:false,error:"Invalid Body"
            },{status:400})
        }else{
            return NextResponse.json({success:false,error:"Unknown error"},{status:500})
        }
        
    }
}