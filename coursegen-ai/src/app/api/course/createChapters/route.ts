//this is the backend fo teh createcourse , taht is activated when a b title adna  bunch of units are added and passed to the backend
//once lets go ai then it will hit this endpoint adn it gfenerates some chapters
// /api/course/createcourse

import { NextResponse } from "next/server";
import { createChapterSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";
import { getUnsplashImage } from "@/lib/unsplash";
import { prisma } from "@/lib/db";

export async function POST(req:Request,res:Response){
    //functionality of ai
    try {
        const body = await req.json();
        const {title,units} = createChapterSchema.parse(body) //to get a typesafety data frmo backend
        //destructure title and units

        type outputUnits = {
            title:string, //each unit has a title and an array of chapters
            chapters:{
                youtube_search_query: string;
                chapter_title:string;
            }[];
        }[];

        //to get the output , we use openai api to generate chapters, a json cannot be produced , it might be invalid
        // GPT AI we cannot properly produce valid JSON , there can be a missign harecter and causes entrire json strung to be invalid 
        // strict_json is a pythin library that wraps the GPT API , such that we can give api our ideal sahpe  of json and API generates correct JSON

        //We ask GPt to output JSON if JSON does not mathc ideal JSO formt , we take the error ,feding back to gpt adn generate till a valid json is generated

        let output_units: outputUnits = await strict_output( //we are looking for a array of chapters
            'You are an AI Capable of curating course content, coming up with relavent chapter titles, and finding relavent youtube videos for each chapter',
            new Array(units.length).fill( //user prmpt
                `It is your responsibility to create a course about ${title}. The user has requested to create chapters for each of the units. Then , for each chapter provide a detailed youtube search query that can be used to find and informative educational video for each chapter. Each query should give an educational informative course in youtube`
            ),
            {
                title: 'title of the unit', //description of what has to be produced
                chapters: 'an array of chapters, each chapter should have a youtube_search_query and a name for the chapter generated as chapter_title key in the JSON object',
            }
        );

        const imageSearchTerm = await strict_output(
            `You are An AI capable of finding the most relavent image for the course based on the exact user prompt`,
            `Do provide a good and perfect image search term for the title of the course that is ${title}. This search term will be fed into the Unsplash API , so make sure the search term is closely relavent to the ${title}`,
            { //desired output shapre
                image_search_term: 'a good and closely relavent search term for the title of the course'
            }
        )
        const course_image = await getUnsplashImage(imageSearchTerm.image_search_term)
        const course = await prisma.course.create({
            data:{
                name:title,
                image:course_image
            }
        }); //craete course 

        //create untsi and chapters
        for(const unit of output_units){
            const title = unit.title;
            const prismaUnit = await prisma.unit.create({
                data:{
                    name:title,
                    courseId:course.id
                }
            })
            await prisma.chapter.createMany({
                data: unit.chapters.map((c)=>{
                    return{
                        name: c.chapter_title,
                        youtubeSearchQuery: c.youtube_search_query,
                        unitId: prismaUnit.id
                    }
                })
            })
        }


        return NextResponse.json({courseId:course.id}) //we use this to rediredct to tthe page after creting this

    } catch (error) {
        if(error instanceof ZodError){ //it does not confirm to  schema we retunrded
            return new NextResponse('invalid Body',{status:400})
        }
    }
}