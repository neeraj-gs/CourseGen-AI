"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import Subscription from "./Subscription";
import { createChapterSchema, type CreateChapterInput } from "@/validators/course";
import { MAX_UNITS, MIN_UNITS } from "@/lib/constants";

type Props = {
  isPro: boolean;
  stripeEnabled: boolean;
};

const CreateCourseForm = ({ isPro, stripeEnabled }: Props) => {
  const router = useRouter();

  const { mutate: createChapters, isPending } = useMutation({
    mutationFn: async ({ title, units }: CreateChapterInput) => {
      const res = await axios.post("/api/course/createChapters", {
        title,
        units,
      });
      return res.data as { course_id: string };
    },
  });

  const form = useForm<CreateChapterInput>({
    resolver: zodResolver(createChapterSchema),
    defaultValues: {
      title: "",
      units: ["", "", ""],
    },
  });

  const units = form.watch("units");

  function onSubmit(data: CreateChapterInput) {
    createChapters(data, {
      onSuccess: ({ course_id }) => {
        toast.success("Course created successfully");
        router.push(`/create/${course_id}`);
      },
      onError: (err) => {
        // Surface the server's actual reason ("no credits left", "AI failed",
        // …) instead of one generic message for every failure.
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? (err.response.data.error as string)
            : "Cannot create the course right now. Please try again later.";
        toast.error(message);
      },
    });
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form className="w-full mt-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                <FormLabel className="flex-[1] text-xl">Title</FormLabel>
                <div className="flex-[6] w-full">
                  <FormControl>
                    <Input
                      placeholder="Enter the title of the course"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {units.map((_, i) => (
            <FormField
              key={i}
              control={form.control}
              name={`units.${i}`}
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                  <FormLabel className="flex-[1] text-xl">
                    Unit {i + 1}
                  </FormLabel>
                  <div className="flex-[6] w-full">
                    <FormControl>
                      <Input placeholder="Enter the unit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          ))}

          <div className="flex items-center justify-center mt-4">
            <Separator className="flex-[1]" />
            <div className="flex gap-3 mx-4">
              <Button
                type="button"
                variant="secondary"
                className="font-semibold"
                disabled={units.length >= MAX_UNITS}
                onClick={() => form.setValue("units", [...units, ""])}
              >
                Add Unit <Plus className="w-4 h-4 ml-2 text-green-500" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="font-semibold"
                disabled={units.length <= MIN_UNITS}
                onClick={() => form.setValue("units", units.slice(0, -1))}
              >
                Remove Unit <Trash className="w-4 h-4 ml-2 text-red-500" />
              </Button>
            </div>
            <Separator className="flex-[1]" />
          </div>

          <Button
            disabled={isPending}
            type="submit"
            className="w-full mt-6"
            size="lg"
          >
            {isPending ? (
              <>
                Generating your course
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              </>
            ) : (
              "Generate Your AI Course"
            )}
          </Button>

          {isPending && (
            <p className="mt-3 text-sm text-center text-secondary-foreground/60">
              The AI is writing your syllabus. This usually takes 20–40 seconds.
            </p>
          )}
        </form>
      </Form>

      {!isPro && stripeEnabled && <Subscription />}
    </div>
  );
};

export default CreateCourseForm;
