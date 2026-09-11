"use client";

import React from "react";
import Advertisement, { AdvertisementData } from "./Advertisement";
import { useI18n } from "@/components/I18nProvider";

interface MobileAdBlockProps {
  ad: AdvertisementData;
}

export default function MobileAdBlock({ ad }: MobileAdBlockProps) {
  const { t } = useI18n();

  return (
    <div className="w-full px-4 md:px-8 my-6 lg:hidden flex justify-center">
      <div className="w-full max-w-3xl relative rounded-xl overflow-hidden border border-white/10 shadow-xl bg-black/40">
        <Advertisement 
          ad={ad} 
          className="block w-full h-full"
          mediaClassName="w-full h-auto object-contain max-h-[80vh]" 
        />
        <div className="absolute top-2 rtl:left-2 ltr:right-2 pointer-events-none z-10">
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold tracking-widest text-white/90 border border-white/10 shadow-sm uppercase">
            {t("ads")}
          </div>
        </div>
      </div>
    </div>
  );
}
