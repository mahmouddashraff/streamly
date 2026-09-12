"use client";

import React, { useState, useEffect, useRef } from "react";
import Advertisement, { AdvertisementData } from "./Advertisement";

interface AdLayoutWrapperProps {
  children: React.ReactNode;
  leftAds: AdvertisementData[];
  rightAds: AdvertisementData[];
}

export default function AdLayoutWrapper({ children, leftAds, rightAds }: AdLayoutWrapperProps) {
  const [adHeight, setAdHeight] = useState(0);
  const leftRailRef = useRef<HTMLElement>(null);
  const rightRailRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      // Only apply this logic on mobile breakpoints (< 768px)
      if (window.innerWidth >= 768) {
        setAdHeight(0);
        return;
      }
      
      const leftH = leftRailRef.current ? leftRailRef.current.getBoundingClientRect().height : 0;
      const rightH = rightRailRef.current ? rightRailRef.current.getBoundingClientRect().height : 0;
      
      setAdHeight(Math.max(leftH, rightH));
    };

    updateHeight();
    
    // ResizeObserver tracks actual rendered height changes (image loads, etc.)
    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    if (leftRailRef.current) observer.observe(leftRailRef.current);
    if (rightRailRef.current) observer.observe(rightRailRef.current);

    window.addEventListener('resize', updateHeight);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [leftAds, rightAds]);

  const hasLeft = leftAds.length > 0;
  const hasRight = rightAds.length > 0;
  const hasBoth = hasLeft && hasRight;

  const mobileRailClass = hasBoth 
    ? "w-[22vw] sm:w-[130px]" 
    : "w-[32vw] sm:w-[150px]";
  const desktopRailClass = "md:w-[150px] lg:w-[160px] xl:w-[200px] 2xl:w-[300px]";
  const adRailClass = `${mobileRailClass} ${desktopRailClass} flex shrink-0 flex-col gap-2 lg:gap-4 p-0 sm:p-2 lg:p-4 sticky top-[73px] md:h-[calc(100vh-73px)] overflow-y-auto overflow-x-hidden no-scrollbar`;

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
          <aside className={adRailClass} ref={leftRailRef}>
            {leftAds.map(ad => (
              <Advertisement 
                key={ad.id} 
                ad={ad} 
                className="w-full md:flex-1 rounded-sm lg:rounded-lg overflow-hidden flex flex-col" 
                mediaClassName="w-full h-auto object-contain md:h-full md:object-cover" 
              />
            ))}
          </aside>
        )}

        {/* Main Content Area
            overflow-hidden: Strictly prevents website content from escaping and overlapping ads
            rtl:[direction:rtl] ltr:[direction:ltr]: Restores correct LTR/RTL text direction inside */}
        <div 
          className="min-w-0 max-w-full overflow-hidden rtl:[direction:rtl] ltr:[direction:ltr]"
          style={{ marginTop: adHeight > 0 ? `${adHeight}px` : undefined }}
        >
          {children}
        </div>

        {/* Right Ad Rail (Always on physical right) */}
        {hasRight && (
          <aside className={adRailClass} ref={rightRailRef}>
            {rightAds.map(ad => (
              <Advertisement 
                key={ad.id} 
                ad={ad} 
                className="w-full md:flex-1 rounded-sm lg:rounded-lg overflow-hidden flex flex-col" 
                mediaClassName="w-full h-auto object-contain md:h-full md:object-cover" 
              />
            ))}
          </aside>
        )}

      </div>
    </div>
  );
}
