import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/i18n";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n";
import VideoRow from "@/components/VideoRow";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ExclusivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exclusive, error } = await supabase
    .from('exclusives')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !exclusive) {
    return notFound();
  }

  // Fetch associated videos
  const { data: videosData } = await supabase
    .from('videos')
    .select('*')
    .eq('exclusive_id', id)
    .eq('published', true)
    .order('created_at', { ascending: false });

  const videos = videosData || [];

  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key] || key;

  const title = getLocalizedField(exclusive, 'title', locale);
  const description = getLocalizedField(exclusive, 'description', locale);

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Exclusive Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="relative w-full md:w-64 aspect-video md:aspect-square rounded-xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/10">
            {exclusive.thumbnail ? (
              <img 
                src={exclusive.thumbnail} 
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

        {/* Videos Section */}
        <div className="mt-12">
          {videos.length > 0 ? (
            <VideoRow title={t("videos")} videos={videos} />
          ) : (
            <div className="text-center text-gray-500 py-12 bg-white/5 rounded-xl border border-white/5">
              {t("noVideos")}
            </div>
          )}
        </div>
        
      </div>
    </main>
  );
}
