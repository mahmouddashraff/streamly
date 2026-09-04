"use client";

import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import { getLocalizedField } from "@/lib/i18n";
import { useI18n } from "@/components/I18nProvider";

export default function SoonContentGrid({ content }: { content: any[] }) {
  const { locale, t } = useI18n();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!content || content.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12 bg-white/5 rounded-xl border border-white/5">
        {t("noVideos") || "No content"}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {content.map((item) => {
          if (item._contentType === 'video') {
            return <VideoCard key={item.id} video={item} />;
          }

          // Image Card
          const title = getLocalizedField(item, 'title', locale);
          return (
            <div 
              key={item.id} 
              className="block group w-full outline-none focus:ring-2 focus:ring-white/50 rounded-lg cursor-pointer"
              onClick={() => setLightboxImage(item.image_url)}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-white/5 shadow-md">
                <img
                  src={item.image_url}
                  alt={title}
                  className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110 group-focus:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
                
                {/* Hover overlay with Image Icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/30 shadow-2xl">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="absolute bottom-2.5 rtl:left-2.5 ltr:right-2.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold text-white/90 pointer-events-none">
                  IMAGE
                </div>
              </div>
              
              <div className="mt-3 px-1">
                <h3 className="font-semibold text-sm md:text-base text-white/90 truncate transition-colors group-hover:text-white">
                  {title}
                </h3>
                <div className="flex items-center text-[11px] md:text-xs text-gray-200 mt-1.5 space-x-2 font-medium">
                  <span className="text-white/90">Image</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}
