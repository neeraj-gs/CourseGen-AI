//this is the backend fo teh createcourse , taht is activated when a b title adna  bunch of units are added and passed to the backend
//once lets go ai then it will hit this endpoint adn it gfenerates some chapters

import { NextResponse } from "next/server";

export async function POST(req:Request,res:Response){
    return NextResponse.json({msg:'Hello World'})
}