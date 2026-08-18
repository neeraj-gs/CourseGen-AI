"use client";

import React, { useCallback, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { Chapter } from "@prisma/client";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Props = {
  c: Chapter;
  ci: number;
  completed: Set<string>;
  setCompleted: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export type ChapterCardHandler = {
  /** Resolves once this chapter has finished loading, successfully or not. */
  triggerLoad: () => Promise<void>;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
  ({ c, ci, completed, setCompleted }, ref) => {
    const [success, setSuccess] = useState<boolean | null>(
      c.videoId ? true : null
    );
    const [isLoading, setIsLoading] = useState(false);

    const { mutateAsync: getChapterInfo } = useMutation({
      mutationFn: async () => {
        const res = await axios.post("/api/chapter/getInfo", {
          chapter_id: c.id,
        });
        return res.data;
      },
    });

    const addChapterIdToSet = useCallback(() => {
      setCompleted((prev) => {
        if (prev.has(c.id)) return prev;
        const newSet = new Set(prev);
        newSet.add(c.id);
        return newSet;
      });
    }, [c.id, setCompleted]);

    React.useEffect(() => {
      if (c.videoId) {
        setSuccess(true);
        addChapterIdToSet();
      }
    }, [c.videoId, addChapterIdToSet]);

    React.useImperativeHandle(ref, () => ({
      async triggerLoad() {
        if (c.videoId) {
          addChapterIdToSet();
          return;
        }

        setIsLoading(true);
        try {
          await getChapterInfo();
          setSuccess(true);
        } catch (err) {
          setSuccess(false);
          const message =
            axios.isAxiosError(err) && err.response?.data?.error
              ? (err.response.data.error as string)
              : "Could not generate this chapter. Try again later.";
          toast.error(`${c.name}: ${message}`);
        } finally {
          // Mark done either way so a single failing chapter can't block the
          // whole course from being saved.
          addChapterIdToSet();
          setIsLoading(false);
        }
      },
    }));

    return (
      <div
        className={cn(
          "px-4 py-2 mt-3 rounded flex items-center justify-between gap-3 transition-colors",
          {
            "bg-secondary": success === null,
            "bg-red-500 text-white": success === false,
            "bg-green-500 text-white": success === true,
          }
        )}
      >
        <h5 className="min-w-0 break-words">
          <span className="mr-2 opacity-70">{ci + 1}.</span>
          {c.name}
        </h5>

        {isLoading && <Loader2 className="flex-shrink-0 w-5 h-5 animate-spin" />}
        {!isLoading && success === true && (
          <CheckCircle2 className="flex-shrink-0 w-5 h-5" />
        )}
        {!isLoading && success === false && (
          <XCircle className="flex-shrink-0 w-5 h-5" />
        )}
      </div>
    );
  }
);

ChapterCard.displayName = "ChapterCard";

export default ChapterCard;
