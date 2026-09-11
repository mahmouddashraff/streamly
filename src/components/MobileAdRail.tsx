"use client";

import React from "react";
import Advertisement, { AdvertisementData } from "./Advertisement";
import { useI18n } from "@/components/I18nProvider";

interface MobileAdRailProps {
  ads: AdvertisementData[];
}

export default function MobileAdRail({ ads }: MobileAdRailProps) {
  const { t } = useI18n();

  if (!ads || ads.length === 0) return null;

  return (
    <div className="w-full py-8 border-t border-white/10 mt-8 lg:hidden bg-black/20">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-lg md:text-xl font-bold text-white/80 mb-6 uppercase tracking-wider">
          {t("ads")}
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {ads.map((ad) => (
            <div 
              key={ad.id} 
              className="relative w-full max-w-[320px] h-[250px] bg-black/40 rounded-xl overflow-hidden border border-white/5 shadow-xl flex items-center justify-center p-2"
            >
              <Advertisement 
                ad={ad} 
                className="block w-full h-full"
                mediaClassName="w-full h-full object-contain" 
              />
              <div className="absolute top-2 rtl:left-2 ltr:right-2 pointer-events-none z-10">
                <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold tracking-widest text-white/90 border border-white/10 shadow-sm uppercase">
                  {t("ads")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
