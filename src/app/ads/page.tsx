import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n";
import Advertisement, { AdvertisementData } from "@/components/Advertisement";
import { Suspense } from "react";
import Footer from "@/components/Footer";

// Revalidate this page occasionally, but since ads are active/inactive we want it relatively fresh.
export const revalidate = 60;

export default async function AdsPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "en";
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key];

  const { data: rawAds } = await supabase
    .from("advertisements")
    .select("*")
    .eq("active", true)
    .in("position", ["ads_page", "ads_page_left", "ads_page_right", "ads_page_both"])
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const ads = rawAds || [];

  return (
    <main className="min-h-screen bg-background pt-24 pb-16 flex flex-col">
      <div className="container mx-auto px-4 md:px-8 flex-1">
        <div className="mb-10 text-center md:text-start">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 font-display">
            {t("adsPage")}
          </h1>
          <div className="w-16 h-1 bg-accent mx-auto md:mx-0 rounded-full" />
        </div>

        {ads.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center">
            <p className="text-gray-400 text-lg">{t("noAdvertisements")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad: any) => (
              <div 
                key={ad.id} 
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden aspect-video relative group hover:border-white/20 transition-colors shadow-lg"
              >
                <Advertisement ad={ad as AdvertisementData} className="w-full h-full" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-auto pt-16">
        <Footer />
      </div>
    </main>
  );
}
