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
      <div className="relative overflow-hidden border border-splice bg-bench dark:border-white/[0.09]">
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
            className="group absolute inset-0 grid place-items-center bg-bench/35 transition-colors hover:bg-bench/20"
          >
            {/* Square, because nothing else on this page is round. */}
            <span className="grid h-16 w-16 place-items-center bg-emulsion transition-transform motion-safe:group-hover:scale-[1.06] sm:h-20 sm:w-20">
              <Play className="ms-1 h-6 w-6 fill-lightbox text-lightbox sm:h-7 sm:w-7" />
            </span>
          </button>
        )}
      </div>

      <figcaption className="mt-3 flex items-center justify-between gap-4 font-data text-[10px] font-light uppercase tracking-[0.22em] text-dust">
        <span>Course.mp4 — full run, unedited</span>
        <span aria-hidden="true">{duration}</span>
      </figcaption>
    </figure>
  );
};

export default DemoVideo;
