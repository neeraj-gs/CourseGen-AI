//this is the backend fo teh createcourse , taht is activated when a b title adna  bunch of units are added and passed to the backend
//once lets go ai then it will hit this endpoint adn it gfenerates some chapters

import { NextResponse } from "next/server";
import { createChapterSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";

export async function POST(req:Request,res:Response){
    //functionality of ai
    try {
        const body = await req.json();
        const {title,units} = createChapterSchema.parse(body) //to get a typesafety data frmo backend

        type outputUnits = {
            title:string,
            chapters:{
                youtubr_search_query: string;
                chapter_title:string;
            }[];
        };

        //to get the output , we use openai api to generate chapters, a json cannot be produced , it might be invalid

        let output_units: outputUnits = await strict_output( //we are looking for a array of chapters
            'You are an AI Capable of curating course content, coming up with relavent chapter titles, and finding relavent youtube videos for each chapter',
            new Array(units.length).fill(
                `It is your responsibility to create a course about ${title}. The user has requested to create chapters for each of the units. Then , for each chapter provide a detailed youtube search query that can be used to find and informative educational video for each chapter. Each query should give an educational informative course in youtube`
            ),
            {
                title: 'title of the unit',
                chapters: 'an array of chapters, each chapter should have a youtube_search_query and a chapter title key in the JSON object',
            }
        );

        console.log(output_units)
        return NextResponse.json(output_units)

    } catch (error) {
        if(error instanceof ZodError){ //it does not confirm to  schema we retunrded
            return new NextResponse('invalid Body',{status:400})
        }
        else {
            console.error(error); // Log other types of errors for debugging
            return new NextResponse('Internal Server Error', { status: 500 });
        }
    }
}