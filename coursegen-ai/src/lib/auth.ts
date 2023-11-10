//stores our next-auth cionfigutrations and allows to connect to proejct'
//risma adapter is used tointeract with our databse and next auth

import { NextAuthOptions } from "next-auth";
import { prisma } from "./db";


//CONfiguring Next-auth

export const authOptions:NextAuthOptions = { //this is where we have auth optionsa of type next-auth options
    session:{
        strategy:'jwt'
    },
    callbacks:{
        //this are a bunch of fucntinos
        jwt: async ({token}) =>{ //if we are given a jwt token, token will have id,email on it , we will search for user with that email and then we bind id and credits to the token itself
            const db_user = await prisma.user.findFirst({
                email:token.email
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
                session.user.image = token.image
                session.user.credits = token.credits
            }

            return session
        }
    }
    
}