// /api/chapter/getInfo 

import { NextResponse } from "next/server";

const sleep =async () => new Promise((resolve)=>{
    setTimeout(resolve,Math.random()*4000)
}
)
//just wait for random timing between 0 to 4 s

export async function POST(req:Request,res:Response){
    try {
        await sleep();
        return NextResponse.json({message:"Hello"})
        
    } catch (error) {
        
    }
}