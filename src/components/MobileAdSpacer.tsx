"use client";

import { useEffect, useState } from "react";

export default function MobileAdSpacer() {
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    // Only run on mobile viewports (< 768px in Tailwind is roughly the boundary for md: and grid changes)
    // Actually, Ad rails might be present on all widths, but on Desktop the grid layout naturally handles everything.
    // However, on mobile, if the grid is `[100px_1fr_100px]`, the side rails don't stretch the center row.
    // Let's run this calculation on all viewports, it'll safely calculate 0 if Hero covers the Ads or if no Ads exist.
    
    const calculateSpacer = () => {
      // Check if we are on mobile (where this issue is prominent)
      if (window.innerWidth >= 1024) {
        setSpacerHeight(0);
        return;
      }

      const leftRail = document.getElementById('left-ad-rail');
      const rightRail = document.getElementById('right-ad-rail');
      const heroEl = document.getElementById('hero-section');
      
      let leftHeight = 0;
      let rightHeight = 0;
      let heroHeight = 0;

      if (leftRail) {
        // Measure children to get actual content height, not the sticky container height
        const children = Array.from(leftRail.children);
        leftHeight = children.reduce((acc, child) => acc + child.getBoundingClientRect().height, 0);
      }
      
      if (rightRail) {
        const children = Array.from(rightRail.children);
        rightHeight = children.reduce((acc, child) => acc + child.getBoundingClientRect().height, 0);
      }
      
      if (heroEl) {
        heroHeight = heroEl.getBoundingClientRect().height;
        // The Hero has a massive mt-[-120px] on the element right after it in HomeReveal.
        // We should account for the visual overlap area.
        // The effective height of the Hero that blocks the background is heroHeight - 120 (on mobile)
        const overlap = window.innerWidth >= 768 ? 160 : 120;
        heroHeight = heroHeight - overlap;
      }

      const maxAdHeight = Math.max(leftHeight, rightHeight);
      
      // If the tallest ad rail is taller than the Hero's effective height,
      // we need to push the content down by the difference + a small gap (24px)
      if (maxAdHeight > heroHeight && maxAdHeight > 0) {
        const diff = maxAdHeight - heroHeight;
        setSpacerHeight(diff + 24);
      } else {
        setSpacerHeight(0);
      }
    };

    calculateSpacer();

    // Use ResizeObserver on the ad rails to listen for image/video load layout shifts
    const observer = new ResizeObserver(() => calculateSpacer());
    const leftRail = document.getElementById('left-ad-rail');
    const rightRail = document.getElementById('right-ad-rail');
    const heroEl = document.getElementById('hero-section');
    
    if (leftRail) observer.observe(leftRail);
    if (rightRail) observer.observe(rightRail);
    if (heroEl) observer.observe(heroEl);

    window.addEventListener('resize', calculateSpacer);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculateSpacer);
    };
  }, []);

  if (spacerHeight <= 0) return null;

  return (
    <div 
      aria-hidden="true" 
      style={{ height: `${spacerHeight}px` }} 
      className="w-full transition-all duration-300 ease-in-out lg:hidden"
    />
  );
}
