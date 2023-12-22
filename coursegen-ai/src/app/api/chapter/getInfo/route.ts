// /api/chapter/getInfo 

import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { getTranscript, searchYouTube } from "@/lib/youtube";
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
        const videoId = await searchYouTube(chapter.youtubeSearchQuery)
        let transcript = await getTranscript(videoId);
        let maxl = 200;
        transcript = transcript.split(' ').slice(0,maxl).join(' ')

        const {summary}:{summary:string} = await strict_output(
            "You are An AI that is capable of Summarizing a youtube transcript.",
            "Summarise in 200 words or less and do not talk of the sponsors of the video or anything unrealted to the main topic , also do not introduce what the summary is about.\n"+transcript,
            {
                summary: 'Summary of the transcript'
            }
        );
        return NextResponse.json({videoId,transcript,summary})


        
        
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