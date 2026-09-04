import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import WatchClientPage from "./WatchClientPage";

export const revalidate = 60;

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  
  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (!video) {
    notFound();
  }

  const { data: relatedVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('category', video.category)
    .neq('id', video.id)
    .eq('published', true)
    .limit(10);

  return <WatchClientPage video={video} relatedVideos={relatedVideos || []} />;
}
