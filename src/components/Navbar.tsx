"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Menu, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/I18nProvider";
import { setLanguage } from "@/app/actions/i18n";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function Navbar({ settings }: { settings?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { user, role, loading } = useAuth();

  const isAdmin = pathname.startsWith("/admin");
  
  const activeLogo = locale === "en" 
    ? (settings?.logo_en_url || settings?.site_logo_url)
    : (settings?.logo_ar_url || settings?.site_logo_url);
    
  const activeSiteName = locale === "en"
    ? (settings?.site_name_en || settings?.site_name || "watch today's events")
    : (settings?.site_name_ar || settings?.site_name || "شاهد الحدث اليوم");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    startTransition(async () => {
      await setLanguage(newLocale);
      router.refresh();
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (isAdmin) return null;

  const navLinks = [
    { name: t("soon"), path: "/soon" },
    { name: t("exclusive"), path: "/exclusives" },
    { name: t("todaysEvent"), path: "/todays-events" },
    { name: t("presenters"), path: "/presenters" },
    { name: t("podcast"), path: "/podcasts" },
    { name: t("channels"), path: "/channels" },
    { name: t("guests"), path: "/guests" },
    { name: t("myList"), path: "/my-list" },
    { name: t("ads"), path: "/ads" },
    { name: t("downloadApp"), path: "/download-app" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 ease-in-out",
        isScrolled 
          ? "bg-background/90 backdrop-blur-xl border-b border-white/10 shadow-lg py-2" 
          : "bg-gradient-to-b from-black/80 via-black/50 to-transparent py-4"
      )}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-8 flex items-center justify-between lg:gap-4 xl:gap-8 w-full max-w-full overflow-hidden">
        {/* 1. Left Side: Mobile Hamburger + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          
          {/* Mobile Hamburger Menu (Left side) */}
          <button 
            className="lg:hidden p-1 -ml-1 ltr:mr-1 rtl:-mr-1 rtl:ml-1 text-white hover:text-accent transition-colors flex-shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo & Site Name */}
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-1.5 sm:gap-3 group shrink min-w-0"
          >
            {activeLogo && (
              <img 
                src={activeLogo} 
                alt={activeSiteName} 
                className="h-6 xs:h-7 sm:h-10 md:h-14 lg:h-8 xl:h-10 2xl:h-12 w-auto object-contain transition-transform lg:group-hover:scale-105 shrink-0"
              />
            )}
            <div className="flex flex-col items-start text-start shrink min-w-0">
              <span 
                className="text-xs xs:text-sm sm:text-xl md:text-3xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold transition-transform lg:group-hover:scale-105 active:scale-95 whitespace-nowrap leading-tight truncate w-full" 
                style={{ fontFamily: '"Alpha Eco", system-ui, sans-serif', color: '#800020' }} 
              >
                {activeSiteName}
              </span>
              <span 
                className="text-[9px] xs:text-[10px] sm:text-sm md:text-lg lg:text-xs xl:text-sm 2xl:text-base font-medium tracking-wide mt-0 xs:mt-0.5 transition-transform lg:group-hover:scale-105 whitespace-nowrap truncate w-full"
                style={{ fontFamily: 'var(--font-qahiri), system-ui, sans-serif', color: '#C0C0C0', wordSpacing: '0.2em' }}
              >
                {t("producer")}
              </span>
            </div>
          </Link>
        </div>
          
        {/* 2. Center: Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center lg:gap-2 xl:gap-4 2xl:gap-6 flex-nowrap flex-1 shrink min-w-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={cn(
                "lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold transition-colors hover:text-white whitespace-nowrap",
                pathname === link.path ? "text-white" : "text-gray-400"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. Right Side: Search, Lang, Login/User */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 md:gap-4 shrink-0">
          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-white hover:text-accent transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <form 
              onSubmit={handleSearch} 
              className={cn(
                "absolute ltr:right-0 rtl:left-0 top-1/2 -translate-y-1/2 transition-all duration-300 ease-out flex items-center",
                isSearchOpen ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"
              )}
            >
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/20 text-white text-sm rounded-md ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2 focus:outline-none focus:border-white/50 backdrop-blur-md transition-all"
                autoFocus={isSearchOpen}
                onBlur={() => !searchQuery && setIsSearchOpen(false)}
              />
              <Search className="absolute ltr:left-3 rtl:right-3 w-4 h-4 text-gray-400" />
            </form>
          </div>

          <button
            onClick={toggleLanguage}
            disabled={isPending}
            className="flex items-center gap-1 sm:gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Switch Language"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{locale === "ar" ? "EN" : "عربي"}</span>
            <span className="sm:hidden">{locale === "ar" ? "EN" : "AR"}</span>
          </button>

          {!loading && !user && (
            <Link 
              href="/login" 
              className="text-[10px] xs:text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors whitespace-nowrap"
            >
              {t("signIn")}
            </Link>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3 md:gap-6">
              {role === 'admin' && (
                <Link href="/admin" className="text-white hover:text-accent transition-colors" title={t("dashboard")}>
                   <User className="w-5 h-5" />
                </Link>
              )}
              <Link 
                href="/my-purchased-videos"
                className="text-xs sm:text-sm font-bold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
              >
                {t("myPurchasedVideos")}
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-xs sm:text-sm font-bold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
              >
                {t("signOut")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 top-[73px] bg-background/95 backdrop-blur-xl border-t border-white/10 transition-all duration-300 ease-in-out overflow-y-auto overscroll-contain pb-24",
          mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="p-6">
          <form onSubmit={handleSearch} className="mb-8 relative">
             <Search className="absolute ltr:left-4 rtl:right-4 top-3.5 w-5 h-5 text-gray-400" />
             <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-base rounded-lg ltr:pl-12 rtl:pr-12 ltr:pr-4 rtl:pl-4 py-3 focus:outline-none focus:border-white/30"
            />
          </form>
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={cn(
                  "text-xl font-bold transition-colors",
                  pathname === link.path ? "text-white" : "text-gray-400"
                )}
              >
                {link.name}
              </Link>
            ))}
            {!loading && !user && (
              <Link
                href="/login"
                className="text-xl font-bold text-white transition-colors mt-4 bg-white/10 p-3 rounded-lg text-center"
              >
                {t("signIn")}
              </Link>
            )}
            {!loading && user && (
              <div className="flex flex-col gap-6 mt-4 pt-4 border-t border-white/10">
                {role === 'admin' && (
                  <Link href="/admin" className="text-xl font-bold text-accent transition-colors">
                    {t("dashboard")}
                  </Link>
                )}
                <Link href="/my-purchased-videos" className="text-xl font-bold text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  {t("myPurchasedVideos")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xl font-bold text-gray-400 text-start transition-colors"
                >
                  {t("signOut")}
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

