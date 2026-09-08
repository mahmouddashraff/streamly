"use client";

import { useEffect, useState } from "react";
import VideoGrid from "@/components/VideoGrid";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Video } from "@/lib/types";
import { useI18n } from "@/components/I18nProvider";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function MyPurchasedVideosPage() {
  const [purchasedVideos, setPurchasedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchPurchased() {
      if (!user) {
        setPurchasedVideos([]);
        setLoading(false);
        return;
      }
      
      const supabase = createClient();
      
      // Fetch the grants
      const { data: grants } = await supabase
        .from('video_access_grants')
        .select('video_id')
        .eq('user_id', user.id)
        .is('revoked_at', null);
        
      if (!grants || grants.length === 0) {
        setPurchasedVideos([]);
        setLoading(false);
        return;
      }
      
      const videoIds = grants.map(row => row.video_id);
      
      // Fetch the actual videos
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds);
        
      if (videos) setPurchasedVideos(videos);
      setLoading(false);
    }
    
    if (!authLoading) {
      fetchPurchased();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div className="container mx-auto px-4 py-24 text-center">{t("loading")}</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 min-h-[80vh] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center py-24 px-4 border border-white/5 rounded-2xl bg-white/[0.02] w-full max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">{t("signInToWatch")}</h2>
          <button 
            onClick={() => router.push("/login?redirect=/my-purchased-videos")}
            className="bg-white text-black px-8 py-3.5 rounded-md font-bold hover:bg-white/90 transition-transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {t("signIn")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-[80vh]">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-12 text-white">{t("myPurchasedVideos")}</h1>
      
      {purchasedVideos.length > 0 ? (
        <VideoGrid videos={purchasedVideos} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-24 px-4 border border-white/5 rounded-2xl bg-white/[0.02] mt-8">
          <div className="bg-white/5 p-5 rounded-full mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">No Purchased Videos</h2>
          <p className="text-gray-400 max-w-md mb-10 text-lg leading-relaxed">
            You haven't purchased any videos yet. When you do, they will appear securely here.
          </p>
          <Link 
            href="/"
            className="bg-white text-black px-8 py-3.5 rounded-md font-bold hover:bg-white/90 transition-transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {t("exploreContent")}
          </Link>
        </div>
      )}
    </div>
  );
}
