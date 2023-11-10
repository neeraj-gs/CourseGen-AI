//we will define the shape of the form and we use zod as the library

import {z} from 'zod'

export const createChapterSchema = z.object({
    title:z.string().min(3).max(100),
    units: z.array(z.string())
})