import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/i18n";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n";
import SoonContentGrid from "@/components/SoonContentGrid";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function SoonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: soon, error } = await supabase
    .from('soon')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !soon) {
    return notFound();
  }

  // Fetch associated videos
  const { data: videosData } = await supabase
    .from('videos')
    .select('*')
    .eq('soon_id', id)
    .eq('published', true);

  const videos = (videosData || []).map(v => ({ ...v, _contentType: 'video' }));

  // Fetch associated images
  const { data: imagesData } = await supabase
    .from('soon_images')
    .select('*')
    .eq('soon_id', id)
    .eq('published', true);

  const images = (imagesData || []).map(i => ({ ...i, _contentType: 'image', thumbnail: i.image_url }));

  // Merge and sort
  const content = [...videos, ...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key] || key;

  const title = getLocalizedField(soon, 'title', locale);
  const description = getLocalizedField(soon, 'description', locale);

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Soon Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="relative w-full md:w-64 aspect-video md:aspect-square rounded-xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/10">
            {soon.thumbnail ? (
              <img 
                src={soon.thumbnail} 
                alt={title} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                No Thumbnail
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-start">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">
              {title}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              {description || t("noDescription")}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 pl-1 border-l-4 border-accent">{t("videos")}</h2>
          <SoonContentGrid content={content} />
        </div>
        
      </div>
    </main>
  );
}
