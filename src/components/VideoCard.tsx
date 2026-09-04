"use client";

import Link from "next/link";
import { Play, Plus, Check } from "lucide-react";
import { Video } from "@/lib/types";
import { getLocalizedField } from "@/lib/i18n";
import { useI18n } from "@/components/I18nProvider";
import { useMyList } from "@/components/MyListProvider";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const { t, locale } = useI18n();
  const { myList, addToMyList, removeFromMyList } = useMyList();
  const isSaved = myList.includes(video.id);

  const handleMyListClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the watch page
    e.stopPropagation();
    if (isSaved) {
      removeFromMyList(video.id);
    } else {
      addToMyList(video.id);
    }
  };
  
  return (
    <Link href={`/watch/${video.id}`} className="block group w-full outline-none focus:ring-2 focus:ring-white/50 rounded-lg">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-white/5 shadow-md">
        {/* Thumbnail */}
        <img
          src={video.thumbnail}
          alt={getLocalizedField(video, 'title', locale)}
          className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110 group-focus:scale-110"
          loading="lazy"
        />
        
        {/* Subtle Dark Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
          
          {/* Top Actions */}
          <div className="flex justify-end">
            <button 
              onClick={handleMyListClick}
              className="bg-black/60 hover:bg-white hover:text-black text-white p-2 rounded-full backdrop-blur-md transition-colors shadow-lg"
              title={isSaved ? t("removeFromMyList") : t("addToMyList")}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Play Button */}
          <div className="flex-1 flex items-center justify-center pointer-events-none">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/30 shadow-2xl">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 rtl:left-2.5 ltr:right-2.5 flex flex-col gap-1.5 items-end pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest text-white/90 border border-white/10 shadow-sm">
            HD
          </div>
        </div>
        
        {/* Duration */}
        <div className="absolute bottom-2.5 rtl:left-2.5 ltr:right-2.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold text-white/90 pointer-events-none">
          {video.duration}
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="font-semibold text-sm md:text-base text-white/90 truncate transition-colors group-hover:text-white">
          {getLocalizedField(video, 'title', locale)}
        </h3>
        <div className="flex items-center text-[11px] md:text-xs text-gray-200 mt-1.5 space-x-2 font-medium">
          <span className="text-green-400 font-semibold">{video.year}</span>
          <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          <span className="text-white/90">{video.category}</span>
          <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          <span className="capitalize border border-white/20 rounded px-1.5 py-0.5 bg-white/10 text-white/90">{video.type === "movie" ? t("movie") : t("episode")}</span>
        </div>
      </div>
    </Link>
  );
}
