"use client";

import { useI18n } from "@/components/I18nProvider";
import { getLocalizedField } from "@/lib/i18n";
import { Video } from "@/lib/types";

interface HeroProps {
  onReveal?: () => void;
  isOpen?: boolean;
  settings?: any;
}

export default function Hero({ onReveal, isOpen, settings }: HeroProps) {
  const { t } = useI18n();

  return (
    <div id="hero-section" className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center mb-12 overflow-hidden">
      {/* Background Image & Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings?.hero_background_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"}
          alt="Hero"
          className="w-full h-full object-cover object-top opacity-50 transition-transform duration-[20s] ease-linear scale-110"
        />
        {/* Dark overlay for cinematic feel */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Radial gradient to focus on the center text */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black/95" />
        {/* Bottom gradient to fade into content */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col items-center text-center max-w-5xl">
        <button 
          onClick={onReveal}
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-tight transition-all duration-700 ease-in-out hover:scale-105 hover:brightness-125 focus:outline-none bg-transparent border-none ${isOpen ? 'translate-y-[-2rem] drop-shadow-2xl' : 'drop-shadow-2xl'}`}
          style={{ fontFamily: 'var(--font-qahiri), system-ui, sans-serif', color: '#800020', textShadow: '0px 0px 20px rgba(128, 0, 32, 0.9), 0px 0px 40px rgba(128, 0, 32, 0.6), 0px 4px 10px rgba(0, 0, 0, 0.8)' }}
        >
          {t("landingHero")}
        </button>
      </div>
    </div>
  );
}

