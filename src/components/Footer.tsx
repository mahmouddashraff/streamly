"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

export default function Footer({ settings }: { settings?: any }) {
  const pathname = usePathname();
  const { t, locale } = useI18n();

  if (pathname.startsWith("/admin")) return null;
  
  const activeLogo = locale === "en" 
    ? (settings?.logo_en_url || settings?.site_logo_url)
    : (settings?.logo_ar_url || settings?.site_logo_url);
    
  const activeSiteName = locale === "en"
    ? (settings?.site_name_en || settings?.site_name || "watch today's events")
    : (settings?.site_name_ar || settings?.site_name || "شاهد الحدث اليوم");

  return (
    <footer className="bg-background py-12 border-t border-border mt-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              {activeLogo && (
                <img 
                  src={activeLogo} 
                  alt={activeSiteName} 
                  className="h-12 md:h-16 w-auto object-contain"
                />
              )}
              <h3 className="text-xl whitespace-nowrap" style={{ fontFamily: '"Alpha Eco", system-ui, sans-serif', color: '#800020' }}>
                {activeSiteName}
              </h3>
            </div>
            <p className="text-muted-foreground mt-4 mb-6 leading-relaxed max-w-sm">
              {settings?.site_description || t("producer")}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              {settings?.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
                  Facebook
                </a>
              )}
              {settings?.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
                  Instagram
                </a>
              )}
              {settings?.social_twitter && (
                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
                  X (Twitter)
                </a>
              )}
              {settings?.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
                  YouTube
                </a>
              )}
              {settings?.social_tiktok && (
                <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
                  TikTok
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Browse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/exclusives" className="hover:text-white transition-colors">{t("exclusive")}</Link></li>
              <li><Link href="/todays-events" className="hover:text-white transition-colors">{t("todaysEvent")}</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">{t("presenters")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {settings?.site_name || t("brand")}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
