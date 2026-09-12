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
        
        {/* Left Ad Rail */}
        {leftAds.length > 0 && (
          <aside className="flex w-[80px] min-[375px]:w-[90px] min-[390px]:w-[100px] min-[414px]:w-[110px] sm:w-[130px] md:w-[150px] lg:w-[160px] xl:w-[200px] 2xl:w-[300px] shrink-0 flex-col gap-2 lg:gap-4 p-0 sm:p-2 lg:p-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto overflow-x-hidden no-scrollbar">
            {leftAds.map(ad => (
              <Advertisement 
                key={ad.id} 
                ad={ad} 
                className="w-full h-auto lg:flex-1 rounded-sm lg:rounded-lg overflow-hidden flex flex-col" 
                mediaClassName="w-full h-auto object-contain lg:h-full lg:object-cover" 
              />
            ))}
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 max-w-full">
          {children}
        </div>

        {/* Right Ad Rail */}
        {rightAds.length > 0 && (
          <aside className="flex w-[80px] min-[375px]:w-[90px] min-[390px]:w-[100px] min-[414px]:w-[110px] sm:w-[130px] md:w-[150px] lg:w-[160px] xl:w-[200px] 2xl:w-[300px] shrink-0 flex-col gap-2 lg:gap-4 p-0 sm:p-2 lg:p-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto overflow-x-hidden no-scrollbar">
            {rightAds.map(ad => (
              <Advertisement 
                key={ad.id} 
                ad={ad} 
                className="w-full h-auto lg:flex-1 rounded-sm lg:rounded-lg overflow-hidden flex flex-col" 
                mediaClassName="w-full h-auto object-contain lg:h-full lg:object-cover" 
              />
            ))}
          </aside>
        )}

      </div>
    </div>
  );
}
