"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Share2, ArrowLeft } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import VideoRow from "@/components/VideoRow";
import { Video } from "@/lib/types";
import { useI18n } from "@/components/I18nProvider";
import { getLocalizedField } from "@/lib/i18n";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function WatchClientPage({ video, relatedVideos }: { video: Video, relatedVideos: Video[] }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { user, loading: authLoading } = useAuth();
  
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }
    
    async function checkSaved() {
      const supabase = createClient();
      const { data } = await supabase
        .from('user_lists')
        .select('id')
        .eq('user_id', user!.id)
        .eq('content_id', video.id)
        .single();
        
      if (data) {
        setIsSaved(true);
      }
    }
    checkSaved();
  }, [user, video.id]);

  const toggleMyList = async () => {
    if (!user) {
      router.push(`/login?redirect=/watch/${video.id}`);
      return;
    }
    
    setIsSaving(true);
    const supabase = createClient();
    
    if (isSaved) {
      await supabase
        .from('user_lists')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', video.id);
      setIsSaved(false);
    } else {
      await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          content_id: video.id,
          content_type: video.type === 'movie' || video.type === 'episode' ? 'video' : 'podcast'
        });
      setIsSaved(true);
    }
    setIsSaving(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      <div className="absolute top-0 inset-x-0 h-[60vh] bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-0" />
      
      <div className="w-full max-w-7xl mx-auto pt-24 md:pt-28 px-4 relative z-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium text-sm w-fit group"
        >
          <ArrowLeft className={cn("w-4 h-4 transition-transform", locale === "ar" ? "ml-2 group-hover:translate-x-1" : "mr-2 group-hover:-translate-x-1")} />
          {t("backToBrowse")}
        </button>

        <div className="mb-10 w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/5 relative aspect-video bg-black flex items-center justify-center">
          {authLoading ? (
            <div className="text-white/50">{t("loading")}</div>
          ) : user ? (
            <VideoPlayer url={video.video_url} poster={video.thumbnail} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <img src={video.thumbnail} alt={getLocalizedField(video, 'title', locale)} className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative z-10 text-center flex flex-col items-center gap-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white">{t("signInToWatch")}</h3>
                <button 
                  onClick={() => router.push(`/login?redirect=/watch/${video.id}`)}
                  className="bg-white text-black px-10 py-3.5 rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-lg"
                >
                  {t("signIn")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-8 border-b border-white/10 pb-12">
          <div className="max-w-3xl flex-1">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              {getLocalizedField(video, 'title', locale)}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base font-medium text-gray-400 mb-8">
              <span className="text-green-500 font-bold">{video.year}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
              <span>{video.duration}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
              <span className="border border-white/20 px-2 py-0.5 rounded bg-white/5 tracking-wider text-xs font-semibold">HD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-white text-xs tracking-wide">{video.category}</span>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed md:text-xl font-light">
              {getLocalizedField(video, 'description', locale)}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center gap-4 shrink-0 w-full md:w-auto">
            <button
              onClick={toggleMyList}
              disabled={isSaving || authLoading}
              className={`flex-1 md:w-full flex md:flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                isSaved 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-black/40 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
              } disabled:opacity-50`}
            >
              {isSaved ? <Check className="w-6 h-6 md:w-8 md:h-8 text-green-400" /> : <Plus className="w-6 h-6 md:w-8 md:h-8" />}
              <span className="text-sm font-semibold tracking-wide">{isSaved ? t("saved") : t("myList")}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 md:w-full flex md:flex-col items-center justify-center gap-3 p-4 rounded-xl bg-black/40 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <Share2 className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-sm font-semibold tracking-wide">{copied ? t("copied") : t("share")}</span>
            </button>
          </div>
        </div>
      </div>

      {relatedVideos.length > 0 && (
        <div className="mt-16 relative z-10 max-w-7xl mx-auto px-4 md:px-0">
          <VideoRow title={t("youMayAlsoLike")} videos={relatedVideos} />
        </div>
      )}
    </div>
  );
}
