import React from "react";
import Advertisement, { AdvertisementData } from "./Advertisement";

interface AdLayoutWrapperProps {
  children: React.ReactNode;
  leftAds: AdvertisementData[];
  rightAds: AdvertisementData[];
}

export default function AdLayoutWrapper({ children, leftAds, rightAds }: AdLayoutWrapperProps) {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Main Layout Container with Side Rails */}
      <div className="w-full flex justify-center max-w-[1920px] mx-auto pt-[73px] rtl:flex-row-reverse">
        
        {/* Left Ad Rail (Hidden on mobile/tablet) */}
        {leftAds.length > 0 && (
          <aside className="hidden lg:flex w-[160px] xl:w-[200px] 2xl:w-[300px] shrink-0 flex-col gap-4 p-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto overflow-x-hidden no-scrollbar">
            {leftAds.map(ad => (
              <Advertisement key={ad.id} ad={ad} className="w-full flex-1 rounded-lg" />
            ))}
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 max-w-full">
          {children}
        </div>

        {/* Right Ad Rail (Hidden on mobile/tablet) */}
        {rightAds.length > 0 && (
          <aside className="hidden lg:flex w-[160px] xl:w-[200px] 2xl:w-[300px] shrink-0 flex-col gap-4 p-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto overflow-x-hidden no-scrollbar">
            {rightAds.map(ad => (
              <Advertisement key={ad.id} ad={ad} className="w-full flex-1 rounded-lg" />
            ))}
          </aside>
        )}

      </div>
    </div>
  );
}
