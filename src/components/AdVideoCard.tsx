"use client";

import { Play } from "lucide-react";
import Advertisement, { AdvertisementData } from "./Advertisement";
import { useI18n } from "@/components/I18nProvider";

interface AdVideoCardProps {
  ad: AdvertisementData;
}

export default function AdVideoCard({ ad }: AdVideoCardProps) {
  const { t } = useI18n();

  return (
    <Advertisement ad={ad} className="block group w-full outline-none focus:ring-2 focus:ring-white/50 rounded-lg text-left rtl:text-right">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-white/5 shadow-md">
        {/* Thumbnail: Render the advertisement video exactly like an image cover */}
        <video
          src={ad.image_url}
          className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110 group-focus:scale-110"
          muted
          playsInline
          // Note: Not using autoPlay loop here to act like a static thumbnail, 
          // or we can let the browser pick the poster frame natively.
        />
        
        {/* Subtle Dark Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          
          {/* Play Button */}
          <div className="flex-1 flex items-center justify-center pointer-events-none">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/30 shadow-2xl">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 rtl:left-2.5 ltr:right-2.5 flex flex-col gap-1.5 items-end pointer-events-none">
          <div className="bg-accent/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest text-white/90 border border-white/10 shadow-sm uppercase">
            {t("ads")}
          </div>
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="font-semibold text-sm md:text-base text-white/90 truncate transition-colors group-hover:text-white">
          {ad.name}
        </h3>
        <div className="flex items-center text-[11px] md:text-xs text-gray-200 mt-1.5 space-x-2 font-medium">
          <span className="text-accent font-semibold uppercase">{t("ads")}</span>
        </div>
      </div>
    </Advertisement>
  );
}
