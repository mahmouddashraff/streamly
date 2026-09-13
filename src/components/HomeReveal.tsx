"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import { Video } from "@/lib/types";

import MobileAdSpacer from "./MobileAdSpacer";

interface HomeRevealProps {
  children: React.ReactNode;
  settings?: any;
}

export default function HomeReveal({ children, settings }: HomeRevealProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pb-24 bg-background">
      <Hero onReveal={() => setIsOpen(true)} isOpen={isOpen} settings={settings} />
      
      <div className="mt-[-120px] md:mt-[-160px] relative z-20">
        <div 
          className={`grid transition-all duration-1000 ease-in-out ${
            isOpen 
              ? "grid-rows-[1fr] opacity-100 pointer-events-auto" 
              : "grid-rows-[0fr] opacity-0 pointer-events-none translate-y-12"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-12 md:space-y-16 pt-8 pb-12">
              <MobileAdSpacer />
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
