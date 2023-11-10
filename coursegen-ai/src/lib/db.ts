//contains the library preperation files

//THis is the preperation for the prisma connection between panet scale and our websote

import { PrismaClient } from "@prisma/client";
import "server-only";
 
declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient; //decalre a global type of cached prisma of hte type prismaCLient type
}
 
export let prisma: PrismaClient; //prisma var is what we use to comnucate everywhere , type of prisma cleint
//server  hot reloads ,when dev , so we create a new prisma client instance everytime ,so if we are in the dev process , we cahck for cached prisma instance , if there we dont creae a new instnce
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(); //in produciton mode we will  create a new prisma instance
  //prisma is used anywhere to interact with the database
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}