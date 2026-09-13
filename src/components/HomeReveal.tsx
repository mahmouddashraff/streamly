"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Hero from "@/components/Hero";
import MobileAdSpacer from "./MobileAdSpacer";

interface HomeRevealProps {
  children: React.ReactNode;
  settings?: any;
}

function HomeRevealContent({ children, settings }: HomeRevealProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const isOpen = searchParams.has("explore");

  const handleReveal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("explore", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="pb-24 bg-background">
      <Hero onReveal={handleReveal} isOpen={isOpen} settings={settings} />
      
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

export default function HomeReveal(props: HomeRevealProps) {
  return (
    <Suspense fallback={
      <div className="pb-24 bg-background">
        <Hero isOpen={false} settings={props.settings} />
      </div>
    }>
      <HomeRevealContent {...props} />
    </Suspense>
  );
}
