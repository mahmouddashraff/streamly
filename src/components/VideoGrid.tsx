import { Video } from "@/lib/types";
import VideoCard from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
}

export default function VideoGrid({ videos }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center border border-white/5 rounded-2xl bg-white/[0.02]">
        <div className="bg-white/5 p-4 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">No videos found</h3>
        <p className="text-gray-400 max-w-sm">We couldn't find any content matching your criteria. Try adjusting your filters or search again.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
