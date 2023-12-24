import { Chapter, Unit } from "@prisma/client"

type Props = {
    chapter:Chapter
    unit:Unit
    ui:number
    ci:number
}

const VideoSummary = ({unit,ui,chapter,ci}: Props) => {
  return (
    <div className="flex-[2] mt-16">
        <h4>
            Unit {ui + 1} &bull; Chapter {ci + 1}
        </h4>

        <h1 className="text-3xl font-bold">{chapter.name}</h1>
        <iframe
            title="chapter video"
            className="w-3/4 mt-4 aspect-video "
            src={`https://www.youtube.com/embed/${chapter.videoId}`}
            allowFullScreen
        />

        <div className="mt-4">
            <h3 className="text-2xl font-semibold">Summary</h3>
            <p className="mt-2 text-secondary-foreground/80">{chapter.summary}</p>
        </div>
    </div>
  )
}

export default VideoSummary