import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { dictionaries, Locale, getLocalizedField } from "@/lib/i18n";
import Link from "next/link";

export const revalidate = 60;

export default async function TodaysEventsPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key] || key;
  
  let todaysEvents: any[] = [];
  try {
    const { data } = await supabase.from('todays_events').select('*').eq('published', true).order('created_at', { ascending: false });
    if (data) todaysEvents = data;
  } catch (e) {
    console.error("Today's Events table not available");
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-[80vh]">
      <h1 className="text-3xl font-bold tracking-tight mb-12 border-b border-white/10 pb-6 text-white/90">
        {t("todaysEvent")}
      </h1>
      
      {todaysEvents.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {todaysEvents.map((p: any) => (
            <Link href={`/todays-events/${p.id}`} key={p.id} className="group flex flex-col items-center text-center">
              <div className="w-full aspect-video rounded-lg bg-white/5 border border-white/10 overflow-hidden mb-4 group-hover:scale-105 transition-transform group-hover:border-white/30 shadow-lg">
                 <img src={p.thumbnail || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=60"} alt={getLocalizedField(p, 'title', locale)} className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold text-lg group-hover:text-white transition-colors text-white/80">{getLocalizedField(p, 'title', locale)}</span>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{getLocalizedField(p, 'description', locale)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-2xl text-white/70">{t("noVideos")}</h2>
        </div>
      )}
    </div>
  );
}
