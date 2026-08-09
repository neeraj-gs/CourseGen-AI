"use client";

import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Zap } from "lucide-react";
import toast from "react-hot-toast";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { FREE_CREDITS } from "@/lib/constants";

const Subscription = () => {
  const { data } = useSession();
  const [loading, setLoading] = useState(false);

  const credits = data?.user?.credits ?? 0;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/stripe");
      window.location.href = res.data.url;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? (error.response.data.error as string)
          : "Could not start checkout. Please try again.";
      toast.error(message);
      setLoading(false);
    }
    // On success the browser navigates away, so `loading` stays true on purpose.
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm p-4 mx-auto mt-16 rounded-lg bg-secondary">
      <p className="text-sm">
        {credits} / {FREE_CREDITS} free generations left
      </p>
      <Progress
        className="mt-2"
        value={(credits / FREE_CREDITS) * 100}
      />
      <Button
        disabled={loading}
        onClick={handleSubscribe}
        className="mt-4 font-bold text-white transition bg-gradient-to-tr from-green-500 to-blue-500 hover:from-green-500 hover:to-blue-600"
      >
        Upgrade to Pro
        <Zap className="ml-2 fill-white" />
      </Button>
    </div>
  );
};

export default Subscription;
