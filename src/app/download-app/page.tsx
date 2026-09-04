"use client";

import { useI18n } from "@/components/I18nProvider";
import { Smartphone, Apple, Globe, Share, PlusSquare, MoreVertical, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DownloadAppPage() {
  const { t, locale } = useI18n();
  const isRTL = locale === "ar";

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-[80vh]">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Download className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          {t("downloadAppDesc")}
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          {t("downloadAppSubdesc")}
        </p>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Android Card */}
        <div className="flex flex-col border border-white/5 rounded-2xl bg-white/[0.02] p-8 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
            <div className="bg-[#3DDC84]/20 p-3 rounded-xl">
              <Smartphone className="w-8 h-8 text-[#3DDC84]" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t("android")}</h2>
          </div>

          <div className="flex-grow space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                01
              </div>
              <div className="flex-grow pt-1">
                <p className="text-gray-300 leading-relaxed">{t("androidStep1")}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-3 py-2 rounded-lg w-fit">
                  <Globe className="w-4 h-4" />
                  <span>Google Chrome</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                02
              </div>
              <div className="flex-grow pt-1">
                <p className="text-gray-300 leading-relaxed">{t("androidStep2")}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-3 py-2 rounded-lg w-fit">
                  <MoreVertical className="w-4 h-4" />
                  <span>Menu</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                03
              </div>
              <div className="flex-grow pt-1">
                <p className="text-gray-300 leading-relaxed">{t("androidStep3")}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                04
              </div>
              <div className="flex-grow pt-1">
                <p className="text-gray-300 leading-relaxed">{t("androidStep4")}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-[#3DDC84] font-medium">{t("androidFinal")}</p>
          </div>
        </div>

        {/* iPhone Card */}
        <div className="flex flex-col border border-white/5 rounded-2xl bg-white/[0.02] p-8 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
            <div className="bg-white/10 p-3 rounded-xl">
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t("iphone")}</h2>
          </div>

          <div className="flex-grow space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                01
              </div>
              <div className="flex-grow pt-1">
                <p className="text-gray-300 leading-relaxed">{t("iphoneStep1")}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-3 py-2 rounded-lg w-fit">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.96 23.95c-3.15-.05-6.17-1.35-8.4-3.6-2.26-2.26-3.56-5.3-3.56-8.52C0 5.4 5.37 0 11.97 0s11.97 5.37 11.97 11.97c0 3.22-1.3 6.26-3.56 8.52-2.22 2.22-5.22 3.5-8.36 3.56-1.57.03-3.12 1.34-4.52 3.52 1.15-1.5 2.55-2.73 4.2-3.6zM6.9 14.53l5.06 5.06c.4.4 1.05.4 1.45 0l5.06-5.06c.4-.4.4-1.05 0-1.45l-5.06-5.06c-.4-.4-1.05-.4-1.45 0L6.9 13.08c-.4.4-.4 1.05 0 1.45z"/>
                  </svg>
                  <span>Safari</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                02
              </div>
              <div className="flex-grow pt-1">
                <p className="text-gray-300 leading-relaxed">{t("iphoneStep2")}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-3 py-2 rounded-lg w-fit">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                03
              </div>
              <div className="flex-grow pt-1">
                <p className="text-gray-300 leading-relaxed">{t("iphoneStep3")}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 bg-white/5 px-3 py-2 rounded-lg w-fit">
                  <PlusSquare className="w-4 h-4" />
                  <span>Add to Home Screen</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                04
              </div>
              <div className="flex-grow pt-1">
                <p className="text-gray-300 leading-relaxed">{t("iphoneStep4")}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white font-medium">{t("iphoneFinal")}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
