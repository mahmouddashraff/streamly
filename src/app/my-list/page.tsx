"use client";

import { useEffect, useState } from "react";
import VideoGrid from "@/components/VideoGrid";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Video } from "@/lib/types";
import { useI18n } from "@/components/I18nProvider";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function MyListPage() {
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchMyList() {
      if (!user) {
        setSavedVideos([]);
        setLoading(false);
        return;
      }
      
      const supabase = createClient();
      
      // Fetch the generic content_ids
      const { data: userLists } = await supabase
        .from('user_lists')
        .select('content_id')
        .eq('user_id', user.id);
        
      if (!userLists || userLists.length === 0) {
        setSavedVideos([]);
        setLoading(false);
        return;
      }
      
      const contentIds = userLists.map(row => row.content_id);
      
      // Fetch the actual videos
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .in('id', contentIds);
        
      if (videos) setSavedVideos(videos);
      setLoading(false);
    }
    
    if (!authLoading) {
      fetchMyList();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div className="container mx-auto px-4 py-24 text-center">{t("loading")}</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 min-h-[80vh] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center py-24 px-4 border border-white/5 rounded-2xl bg-white/[0.02] w-full max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">{t("signInToUseMyList")}</h2>
          <button 
            onClick={() => router.push("/login?redirect=/my-list")}
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
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-12 text-white">{t("myList")}</h1>
      
      {savedVideos.length > 0 ? (
        <VideoGrid videos={savedVideos} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-24 px-4 border border-white/5 rounded-2xl bg-white/[0.02] mt-8">
          <div className="bg-white/5 p-5 rounded-full mb-6">
            <Plus className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">{t("myListEmptyTitle")}</h2>
          <p className="text-gray-400 max-w-md mb-10 text-lg leading-relaxed">
            {t("myListEmptyDescription")}
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
