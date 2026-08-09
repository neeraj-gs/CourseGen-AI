"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

type Props = {
  /** Runtime label shown in the caption bar, e.g. "01:22". */
  duration: string;
};

/**
 * The demo recording is ~6.5 MB. `preload="none"` plus a poster means the page
 * loads instantly and the video is only fetched when someone asks to watch it.
 */
const DemoVideo = ({ duration }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    setStarted(true);
    // The element already exists, so this runs on a real user gesture and
    // autoplay policies allow it even with sound.
    videoRef.current?.play();
  };

  return (
    <figure className="w-full">
      <div className="relative overflow-hidden border rounded-xl border-rule dark:border-white/15 bg-ink">
        <video
          ref={videoRef}
          src="/Course.mp4"
          poster="/demo-poster.jpg"
          preload="none"
          controls={started}
          playsInline
          // 1786x928 is the recording's native size — declaring it prevents the
          // page from reflowing when the video loads.
          width={1786}
          height={928}
          className="block w-full h-auto"
          onEnded={() => setStarted(false)}
        />

        {!started && (
          <button
            type="button"
            onClick={start}
            aria-label={`Play the ${duration} product demo`}
            className="absolute inset-0 grid transition-colors group place-items-center bg-ink/35 hover:bg-ink/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-grass focus-visible:ring-inset"
          >
            <span className="grid transition-transform rounded-full shadow-lg place-items-center size-16 sm:size-20 bg-grass motion-safe:group-hover:scale-105">
              <Play className="text-white size-7 sm:size-8 fill-white ms-1" />
            </span>
          </button>
        )}
      </div>

      <figcaption className="flex items-center justify-between gap-4 px-1 mt-3 font-mono text-xs tracking-wide uppercase text-mute dark:text-white/50">
        <span>Course.mp4 — full run, unedited</span>
        <span aria-hidden="true">{duration}</span>
      </figcaption>
    </figure>
  );
};

export default DemoVideo;
