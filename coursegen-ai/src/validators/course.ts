import * as z from "zod";
import { MAX_UNITS, MIN_UNITS } from "@/lib/constants";

export const createChapterSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Enter at least 3 characters" })
    .max(80, { message: "Your course title is too long" }),
  units: z
    .array(
      z
        .string()
        .min(1, { message: "A unit cannot be empty" })
        .max(80, { message: "This unit name is too long" })
    )
    .min(MIN_UNITS, { message: `Add at least ${MIN_UNITS} units` })
    // Each unit costs an AI call, so cap it to stay inside the function timeout.
    .max(MAX_UNITS, { message: `You can add at most ${MAX_UNITS} units` }),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
