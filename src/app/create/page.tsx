import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";
import CreateCourseForm from "@/components/CreateCourseForm";
import { getAuthSession } from "@/lib/auth";
import { CheckSubscription } from "@/lib/subscription";
import { isStripeConfigured } from "@/lib/env";
import { isAppConfigured } from "@/lib/demo-mode";
import DemoModeNotice from "@/components/DemoModeNotice";

export const dynamic = "force-dynamic";

const CreateCourse = async () => {
  if (!isAppConfigured()) {
    return <DemoModeNotice feature="Course generation" />;
  }

  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/courses");
  }

  const isPro = await CheckSubscription();

  return (
    <div className="flex flex-col items-start px-4 py-16 mx-auto max-w-xl sm:px-8">
      <h1 className="self-center text-2xl font-bold text-center md:text-3xl">
        Create Your Customized Course
      </h1>

      <div className="flex p-4 mt-5 rounded-lg bg-secondary">
        <InfoIcon className="flex-shrink-0 w-10 h-10 mr-3 text-blue-400" />
        <div className="text-sm">
          Enter a course title and the units or specific topics you want to
          master, and the AI will build a customised syllabus — complete with a
          hand-picked YouTube lesson and summary for every chapter.
        </div>
      </div>

      <CreateCourseForm isPro={isPro} stripeEnabled={isStripeConfigured()} />
    </div>
  );
};

export default CreateCourse;
