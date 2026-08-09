import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { buttonVariants } from "./ui/button";

type Props = {
  /** The thing the visitor was trying to reach, e.g. "The course gallery". */
  feature: string;
};

/**
 * Shown in place of any screen that needs a database or paid API key. Explains
 * what is missing and sends the visitor to the thing that does work.
 */
const DemoModeNotice = ({ feature }: Props) => {
  return (
    <div className="px-6 py-24 mx-auto text-center max-w-xl">
      <p className="font-mono text-xs tracking-widest uppercase text-grass">
        Demo deployment
      </p>

      <h1 className="mt-4 text-3xl font-bold">{feature} is not running here</h1>

      <p className="mt-4 leading-relaxed text-mute dark:text-white/60">
        This deployment ships the demo recording only. {feature} needs a
        database plus OpenAI and YouTube API keys, which are not attached to
        this build.
      </p>

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Link href="/" className={buttonVariants({ className: "bg-grass hover:bg-moss text-white" })}>
          <PlayCircle className="w-4 h-4 mr-2" />
          Watch the demo
        </Link>
        <a
          href="https://github.com/neeraj-gs/CourseGen-AI"
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "secondary" })}
        >
          Run it with your own keys
        </a>
      </div>
    </div>
  );
};

export default DemoModeNotice;
