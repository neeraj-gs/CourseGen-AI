import {
  CHAPTER_COUNT,
  buildField,
} from "@/components/landing/cutting-room-data";

const STILL_DEPTH = 6;

/**
 * The designed fallback for a device with no WebGL.
 *
 * It is the same picture, drawn in CSS: the same thirteen columns, the same
 * candidate field, the same three states in the same three colours, with the
 * survivor of each column standing at the front. A reader who lands here is
 * shown the argument, not a hole where the argument was.
 */
export default function StaticLightTable() {
  const field = buildField(STILL_DEPTH);

  return (
    <div
      className="absolute inset-0 flex items-end justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="flex w-full max-w-4xl gap-[3px] px-6 pb-[18%]"
        style={{ transform: "perspective(900px) rotateX(46deg)" }}
      >
        {Array.from({ length: CHAPTER_COUNT }, (_, chapter) => (
          <div key={chapter} className="flex flex-1 flex-col-reverse gap-[3px]">
            {field
              .filter((c) => c.chapter === chapter)
              .map((c) => (
                <span
                  key={c.rank}
                  className="block h-3 rounded-[1px] sm:h-4"
                  style={{
                    // rank 0 survives and is lit; everything behind it is dust.
                    background: c.rank === 0 ? "#0f766e" : "#8a8880",
                    opacity:
                      c.rank === 0 ? 1 : 0.42 - c.rank * 0.055 + c.score * 0.1,
                  }}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
