import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { dictionaries, Locale, getLocalizedField } from "@/lib/i18n";
import Link from "next/link";

export const revalidate = 60;

export default async function PresentersPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key] || key;
  
  let presenters: any[] = [];
  try {
    const { data } = await supabase.from('presenters').select('*');
    if (data) presenters = data;
  } catch (e) {
    console.error("Presenters table not available");
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-[80vh]">
      <h1 className="text-3xl font-bold tracking-tight mb-12 border-b border-white/10 pb-6 text-white/90">
        {t("presenters")}
      </h1>
      
      {presenters.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {presenters.map((p: any) => (
            <Link href={`/presenters/${p.id}`} key={p.id} className="group flex flex-col items-center text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 border border-white/10 overflow-hidden mb-4 group-hover:scale-105 transition-transform group-hover:border-white/30 shadow-lg">
                 <img src={p.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=60"} alt={getLocalizedField(p, 'name', locale)} className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold text-lg group-hover:text-white transition-colors text-white/80">{getLocalizedField(p, 'name', locale)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-2xl text-white/70">{t("noPresenters")}</h2>
        </div>
      )}
    </div>
  );
}
