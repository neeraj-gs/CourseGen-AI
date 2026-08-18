//allow next-auth to configure and also allows it to access diffrent routes
//on the route that continas ... , the route.ts file handles all the things

//this is taken from next-auth docs 
//this file any route that comes to /api/route it is handeld by next auth ,inclucing gogl ecallbacks and redirects
//


import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions) //handler that handles authenticatoin 
export {handler as GET,handler as POST}