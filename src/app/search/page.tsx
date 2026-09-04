import { createClient } from "@/lib/supabase/server";
import VideoGrid from "@/components/VideoGrid";
import { cookies } from "next/headers";
import { dictionaries, Locale, getLocalizedField } from "@/lib/i18n";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const { q } = await searchParams;
  const query = q?.toLowerCase() || "";

  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key] || key;

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Search className="w-16 h-16 text-white/20 mb-6" />
        <h2 className="text-2xl text-white/60">{t("searchPlaceholder")}</h2>
      </div>
    );
  }

  // Safe fetch function that returns empty array if table doesn't exist
  const safeFetch = async (table: string, columns: string, conditions: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase.from(table).select(columns).or(conditions);
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  };

  // Perform parallel ILIKE searches
  const [rawVideos, rawPodcasts, channels, guests, presenters] = await Promise.all([
    safeFetch('videos', '*', `title.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`),
    safeFetch('podcasts', '*', `title.ilike.%${query}%,description.ilike.%${query}%`),
    safeFetch('channels', '*', `name.ilike.%${query}%,description.ilike.%${query}%`),
    safeFetch('guests', '*', `name.ilike.%${query}%,bio.ilike.%${query}%`),
    safeFetch('presenters', '*', `name.ilike.%${query}%,bio.ilike.%${query}%`)
  ]);

  const videos = rawVideos as any[];
  const podcasts = rawPodcasts as any[];

  const hasResults = videos.length > 0 || podcasts.length > 0 || channels.length > 0 || guests.length > 0 || presenters.length > 0;

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight mb-12 border-b border-white/10 pb-6">
        {t("searchPlaceholder").replace("...", "")}: "{query}"
      </h1>
      
      {!hasResults ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
           <h2 className="text-2xl text-white/70">{t("noResults")}</h2>
        </div>
      ) : (
        <div className="space-y-16">
          {videos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white/90">{t("videosResult")}</h2>
              <VideoGrid videos={videos} />
            </section>
          )}

          {podcasts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white/90">{t("podcastsResult")}</h2>
              <VideoGrid videos={podcasts} />
            </section>
          )}

          {channels.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white/90">{t("channelsResult")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {channels.map((c: any) => (
                  <Link href={`/channels/${c.id}`} key={c.id} className="group flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 overflow-hidden mb-4 group-hover:scale-105 transition-transform group-hover:border-white/30">
                       <img src={c.logo_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&auto=format&fit=crop&q=60"} alt={getLocalizedField(c, 'name', locale)} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold group-hover:text-white transition-colors text-white/80">{getLocalizedField(c, 'name', locale)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {guests.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white/90">{t("guestsResult")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {guests.map((g: any) => (
                  <Link href={`/guests/${g.id}`} key={g.id} className="group flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 overflow-hidden mb-4 group-hover:scale-105 transition-transform group-hover:border-white/30">
                       <img src={g.image_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60"} alt={getLocalizedField(g, 'name', locale)} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold group-hover:text-white transition-colors text-white/80">{getLocalizedField(g, 'name', locale)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {presenters.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white/90">{t("presentersResult")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {presenters.map((p: any) => (
                  <Link href={`/categories`} key={p.id} className="group flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 overflow-hidden mb-4 group-hover:scale-105 transition-transform group-hover:border-white/30">
                       <img src={p.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=60"} alt={getLocalizedField(p, 'name', locale)} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold group-hover:text-white transition-colors text-white/80">{getLocalizedField(p, 'name', locale)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
