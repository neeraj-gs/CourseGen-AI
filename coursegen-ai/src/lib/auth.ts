//stores our next-auth cionfigutrations and allows to connect to proejct'
//risma adapter is used tointeract with our databse and next auth

import { DefaultSession, NextAuthOptions } from "next-auth";
import { prisma } from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from 'next-auth/providers/google'


declare module 'next-auth'{ //specifiying next-auth the types
    interface Session extends DefaultSession{
        user:{ // we have overwritten this user with id and credits , we need to also specify other parametere , so join current uesr type
            id:string;
            credits:number;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt'{ //this is for the jwt , extend type for token itself and append them to it
    interface JWT{
        id:string;
        credits:number;
    }
}



//CONfiguring Next-auth

export const authOptions:NextAuthOptions = { //this is where we have auth optionsa of type next-auth options
    session:{
        strategy:'jwt'
    },
    callbacks:{
        //this are a bunch of fucntinos
        jwt: async ({token}) =>{ //if we are given a jwt token, token will have id,email on it , we will search for user with that email and then we bind id and credits to the token itself
            const db_user = await prisma.user.findFirst({
                where:{
                    email:token.email
                }
            })
            if(db_user){
                token.id = db_user.id;
                token.credits = db_user.credits
            }
            return token //token is now appended with id and credits
        },
        session:({session,token})=>{ //token comes from jwt , 
            if(token){
                session.user.id = token.id;
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture //we use picture because we get it from google authentication
                session.user.credits = token.credits
            }

            return session
        },
  
    },
    secret:process.env.NEXTAUTH_SECRET as string,
        adapter: PrismaAdapter(prisma),
        providers:[
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
            })
        ]
    
}