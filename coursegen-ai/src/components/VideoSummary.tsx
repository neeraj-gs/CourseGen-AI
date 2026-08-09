import { Chapter, Unit } from "@prisma/client";

type Props = {
  chapter: Chapter;
  unit: Unit;
  ui: number;
  ci: number;
};

const VideoSummary = ({ unit, ui, chapter, ci }: Props) => {
  return (
    <div className="w-full">
      <h4 className="text-sm uppercase text-secondary-foreground/60">
        Unit {ui + 1} &bull; Chapter {ci + 1}
      </h4>

      <h1 className="mt-1 text-3xl font-bold break-words">{chapter.name}</h1>

      {chapter.videoId ? (
        <iframe
          title={`Video for ${chapter.name}`}
          className="w-full max-w-3xl mt-4 rounded-lg aspect-video"
          src={`https://www.youtube.com/embed/${chapter.videoId}`}
          allowFullScreen
        />
      ) : (
        // A chapter whose video lookup failed still renders — an iframe pointed
        // at /embed/undefined just shows a broken player.
        <div className="flex items-center justify-center w-full max-w-3xl p-8 mt-4 text-center rounded-lg bg-secondary aspect-video">
          <p className="text-secondary-foreground/60">
            No video was found for this chapter yet.
          </p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-2xl font-semibold">Summary</h3>
        <p className="mt-2 whitespace-pre-line text-secondary-foreground/80">
          {chapter.summary ?? "No summary has been generated for this chapter."}
        </p>
      </div>
    </div>
  );
};

export default VideoSummary;
