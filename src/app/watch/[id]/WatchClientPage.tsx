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
  
  // Secure Video State
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMobile, setRequestMobile] = useState("");
  
  // 1. Fetch Secure URL if Price > 0
  useEffect(() => {
    if (!video.price || video.price <= 0) {
      setSecureUrl(video.video_url);
      return;
    }

    if (authLoading) return;
    if (!user) {
      // Do NOT setSecureUrl(null) here because tab-switching can cause momentary 
      // null user states from Supabase session sync, which would destroy the player.
      return; 
    }

    if (secureUrl) return; // Do not refetch unnecessarily (e.g., on tab switch)

    let isMounted = true;

    async function checkAccess() {
      setCheckingAccess(true);
      try {
        const res = await fetch(`/api/videos/${video.id}/access`);
        const data = await res.json();
        
        if (!isMounted) return;

        if (res.ok && data.url) {
          setSecureUrl(data.url);
          setAccessError(null);
        } else {
          setAccessError(data.error || "Access denied");
          if (data.requestStatus) {
            setRequestStatus(data.requestStatus);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setAccessError("Failed to verify access");
      } finally {
        if (isMounted) setCheckingAccess(false);
      }
    }

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [video.id, video.price, video.video_url, user, authLoading, secureUrl]);

  // 1.5 Live Access Revocation using Supabase Realtime
  useEffect(() => {
    if (!user || !video.price || video.price <= 0) return;

    const supabase = createClient();
    
    const channel = supabase
      .channel(`grant_changes_${video.id}_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_access_grants',
          filter: `video_id=eq.${video.id}`,
        },
        (payload) => {
          if (payload.new.user_id === user.id && payload.new.revoked_at !== null) {
            setSecureUrl(null);
            setAccessError("revoked");
            setCheckingAccess(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, video.id, video.price]);

  // 2. Request Access Submission
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestMobile.trim()) return;
    
    setIsRequesting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: video.id, mobile: requestMobile })
      });
      const data = await res.json();
      
      if (res.ok) {
        setRequestStatus("pending");
      } else {
        alert(data.error || "Request failed");
      }
    } catch (err) {
      alert("Request failed. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };
  
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
          {accessError === "revoked" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <img src={video.thumbnail} alt={getLocalizedField(video, 'title', locale)} className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative z-10 text-center flex flex-col items-center gap-6 p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-red-500/30 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold text-red-500">
                  {locale === 'ar' ? "تم إلغاء وصولك إلى هذا الفيديو." : "Your access to this video has been revoked."}
                </h3>
              </div>
            </div>
          ) : secureUrl ? (
            <VideoPlayer url={secureUrl} poster={video.thumbnail} />
          ) : authLoading || checkingAccess ? (
            <div className="text-white/50">{t("loading")}</div>
          ) : !user && (!video.price || video.price <= 0) ? (
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
          ) : !user && video.price && video.price > 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <img src={video.thumbnail} alt={getLocalizedField(video, 'title', locale)} className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative z-10 text-center flex flex-col items-center gap-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white">{t("signInToWatch")}</h3>
                <p className="text-gray-300">{t("thisVideoRequiresPurchase")}</p>
                <button 
                  onClick={() => router.push(`/login?redirect=/watch/${video.id}`)}
                  className="bg-accent text-white px-10 py-3.5 rounded-lg font-bold hover:bg-accent-hover transition-colors shadow-lg"
                >
                  {t("signIn")}
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
              <img src={video.thumbnail} alt={getLocalizedField(video, 'title', locale)} className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 text-center">
                
                {requestStatus === "pending" || requestStatus === "contacted" ? (
                  <>
                    <Check className="w-16 h-16 text-green-500 mb-2" />
                    <h3 className="text-xl md:text-2xl font-bold text-white">{t("accessRequestSubmitted")}</h3>
                    <p className="text-gray-300">{t("adminWillContact")}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold text-white">{t("thisVideoRequiresPurchase")}</h3>
                    <div className="bg-white/10 px-4 py-2 rounded-lg my-2">
                      <p className="text-lg text-white font-bold">{t("price")}: {video.price}</p>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{t("enterDetailsForAccess")}</p>
                    
                    <form onSubmit={handleRequestAccess} className="w-full flex flex-col gap-3">
                      <input 
                        type="text" 
                        disabled
                        value={user?.email || ""}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white opacity-50 cursor-not-allowed"
                      />
                      <input 
                        type="tel" 
                        required
                        placeholder={t("mobileNumber")}
                        value={requestMobile}
                        onChange={(e) => setRequestMobile(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 focus:border-accent focus:outline-none rounded-lg px-4 py-3 text-white transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={isRequesting}
                        className="w-full bg-accent text-white px-4 py-3 rounded-lg font-bold hover:bg-accent-hover transition-colors shadow-lg mt-2 disabled:opacity-50"
                      >
                        {isRequesting ? t("processing") : t("requestAccess")}
                      </button>
                    </form>
                  </>
                )}
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
