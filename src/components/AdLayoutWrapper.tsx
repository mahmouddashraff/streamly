import React from "react";
import Advertisement, { AdvertisementData } from "./Advertisement";

interface AdLayoutWrapperProps {
  children: React.ReactNode;
  leftAds: AdvertisementData[];
  rightAds: AdvertisementData[];
}

export default function AdLayoutWrapper({ children, leftAds, rightAds }: AdLayoutWrapperProps) {
  const hasLeft = leftAds.length > 0;
  const hasRight = rightAds.length > 0;
  const hasBoth = hasLeft && hasRight;

  const mobileRailClass = hasBoth 
    ? "w-[22vw] sm:w-[130px]" 
    : "w-[32vw] sm:w-[150px]";
  const desktopRailClass = "md:w-[150px] lg:w-[160px] xl:w-[200px] 2xl:w-[300px]";
  const adRailClass = `${mobileRailClass} ${desktopRailClass} flex shrink-0 flex-col gap-2 lg:gap-4 p-0 sm:p-2 lg:p-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto overflow-x-hidden no-scrollbar`;

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Main Layout Container with CSS Grid.
          dir="ltr" guarantees the physical left/right positions are NEVER swapped by RTL. */}
      <div 
        className={`w-full grid max-w-[1920px] mx-auto pt-[73px] ${
          hasBoth ? "grid-cols-[auto_minmax(0,1fr)_auto]" :
          hasLeft ? "grid-cols-[auto_minmax(0,1fr)]" :
          hasRight ? "grid-cols-[minmax(0,1fr)_auto]" :
          "grid-cols-1"
        }`}
        dir="ltr"
      >
        
        {/* Left Ad Rail (Always on physical left) */}
        {hasLeft && (
          <aside className={adRailClass}>
            {leftAds.map(ad => (
              <Advertisement 
                key={ad.id} 
                ad={ad} 
                className="w-full flex-1 rounded-sm lg:rounded-lg overflow-hidden flex flex-col" 
                mediaClassName="w-full h-full object-cover" 
              />
            ))}
          </aside>
        )}

        {/* Main Content Area
            overflow-hidden: Strictly prevents website content from escaping and overlapping ads
            rtl:[direction:rtl] ltr:[direction:ltr]: Restores correct LTR/RTL text direction inside */}
        <div className="min-w-0 max-w-full overflow-hidden rtl:[direction:rtl] ltr:[direction:ltr]">
          {children}
        </div>

        {/* Right Ad Rail (Always on physical right) */}
        {hasRight && (
          <aside className={adRailClass}>
            {rightAds.map(ad => (
              <Advertisement 
                key={ad.id} 
                ad={ad} 
                className="w-full flex-1 rounded-sm lg:rounded-lg overflow-hidden flex flex-col" 
                mediaClassName="w-full h-full object-cover" 
              />
            ))}
          </aside>
        )}

      </div>
    </div>
  );
}
