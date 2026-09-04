import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/i18n";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n";
import VideoRow from "@/components/VideoRow";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: channel, error } = await supabase
    .from('channels')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !channel) {
    return notFound();
  }

  // Fetch associated videos
  const { data: videosData } = await supabase
    .from('videos')
    .select('*')
    .eq('channel_id', id)
    .eq('published', true)
    .order('created_at', { ascending: false });

  const videos = videosData || [];

  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key] || key;

  const name = getLocalizedField(channel, 'name', locale);
  const description = getLocalizedField(channel, 'description', locale);

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Channel Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="relative w-48 h-48 rounded-full overflow-hidden flex-shrink-0 border-4 border-accent shadow-2xl bg-black/50">
            {channel.logo_url ? (
              <img 
                src={channel.logo_url} 
                alt={name} 
                className="object-contain w-full h-full p-4"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                No Logo
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-start">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">
              {name}
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
