"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EntityCard from "./EntityCard";

interface EntityRowProps {
  title: string;
  entities: any[];
  type: "presenter" | "guest" | "channel" | "podcast" | "exclusive" | "todays_event" | "soon";
}

export default function EntityRow({ title, entities, type }: EntityRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (rowRef.current) {
        setIsScrolled(rowRef.current.scrollLeft > 0);
      }
    };
    
    const refCurrent = rowRef.current;
    if (refCurrent) {
      refCurrent.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    
    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!entities.length) return null;

  return (
    <div className="py-6 relative group/row">
      <div className="container mx-auto px-4 md:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-white drop-shadow-lg tracking-wider capitalize">{title}</h2>
      </div>
      
      {isScrolled && (
        <button 
          onClick={() => scroll("left")}
          className="hidden md:flex absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full items-center justify-center ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <div className="bg-black/50 p-2 rounded-full border border-white/10 hover:bg-white/20 transition-colors hover:scale-110">
            <ChevronLeft className="w-6 h-6 text-white rtl:rotate-180" />
          </div>
        </button>
      )}

      <button 
        onClick={() => scroll("right")}
        className="hidden md:flex absolute ltr:right-0 rtl:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full items-center justify-center ltr:bg-gradient-to-l rtl:bg-gradient-to-r from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
      >
        <div className="bg-black/50 p-2 rounded-full border border-white/10 hover:bg-white/20 transition-colors hover:scale-110">
          <ChevronRight className="w-6 h-6 text-white rtl:rotate-180" />
        </div>
      </button>
      
      <div 
        ref={rowRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-8 snap-x snap-mandatory pb-4"
      >
        {entities.map((entity) => (
          <div key={entity.id} className="flex-none w-[40vw] sm:w-[180px] md:w-[220px] lg:w-[250px] snap-start">
            <EntityCard entity={entity} type={type} />
          </div>
        ))}
        <div className="flex-none w-4 md:w-8" />
      </div>
    </div>
  );
}
