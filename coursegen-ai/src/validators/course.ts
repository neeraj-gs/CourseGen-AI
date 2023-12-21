//we will define the shape of the form and we use zod as the library

import * as z from 'zod'

export const createChapterSchema = z.object({
    title:z.string().min(3,{message:"Enter at least 3 Charecters"}).max(50,{message:"Your Chapter Name is Too long"}),
    units: z.array(z.string(),) //array of strings
})