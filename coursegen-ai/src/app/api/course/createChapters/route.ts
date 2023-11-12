//this is the backend fo teh createcourse , taht is activated when a b title adna  bunch of units are added and passed to the backend
//once lets go ai then it will hit this endpoint adn it gfenerates some chapters

import { NextResponse } from "next/server";
import { createChapterSchema } from "@/validators/course";
import { ZodError } from "zod";

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



    } catch (error) {
        if(error instanceof ZodError){ //it does not confirm to  schema we retunrded
            return new NextResponse('invalid Body',{status:400})

        }
    }
}