import { createClient } from "@/lib/supabase/server";
import HomeReveal from "@/components/HomeReveal";
import VideoRow from "@/components/VideoRow";
import EntityRow from "@/components/EntityRow";
import { cookies } from "next/headers";
import { dictionaries, Locale } from "@/lib/i18n";
import { Video } from "@/lib/types";
import { getSiteSettings } from "@/lib/settings";
import AdLayoutWrapper from "@/components/AdLayoutWrapper";
import { AdvertisementData } from "@/components/Advertisement";
import AdVideoRow from "@/components/AdVideoRow";
import React from "react";

export const revalidate = 0; // Disable caching to ensure layout updates are immediate

export default async function Home() {
  const supabase = await createClient();

  // Execute all independent data fetches concurrently
  const [
    { data: soonData },
    { data: exclusivesData },
    { data: todaysEventsData },
    { data: presentersData },
    { data: podcastsData },
    { data: channelsData },
    { data: guestsData },
    { data: adsData },
    settings,
    myListVideos
  ] = await Promise.all([
    supabase.from('soon').select('*').eq('published', true).order('created_at', { ascending: false }),
    supabase.from('exclusives').select('*').eq('published', true).order('created_at', { ascending: false }),
    supabase.from('todays_events').select('*').eq('published', true).order('created_at', { ascending: false }),
    supabase.from('presenters').select('*').order('created_at', { ascending: false }),
    supabase.from('podcasts').select('*').eq('published', true).eq('is_soon', false).order('created_at', { ascending: false }),
    supabase.from('channels').select('*').order('created_at', { ascending: false }),
    supabase.from('guests').select('*').order('created_at', { ascending: false }),
    supabase.from('advertisements').select('*').eq('active', true).order('display_order', { ascending: true }),
    getSiteSettings(),
    (async () => {
      let videos: Video[] = [];
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userLists } = await supabase
            .from('user_lists')
            .select('content_id')
            .eq('user_id', user.id);
            
          if (userLists && userLists.length > 0) {
            const contentIds = userLists.map(row => row.content_id);
            const { data: listVideos } = await supabase
              .from('videos')
              .select('*')
              .in('id', contentIds);
            if (listVideos) videos = listVideos;
          }
        }
      } catch (e) {}
      return videos;
    })()
  ]);

  const soonEntities = soonData || [];
  const exclusives = exclusivesData || [];
  const todaysEvents = todaysEventsData || [];
  const presenters = presentersData || [];
  const podcasts = podcastsData || [];
  const channels = channelsData || [];
  const guests = guestsData || [];
  const allAds = (adsData || []) as AdvertisementData[];

  // Localization
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key] || key;
  
  // Left side gets ads where position includes left or both
  const leftAds = allAds.filter(ad => 
    ad.position === 'left' || 
    ad.position === 'both' || 
    ad.position === 'ads_page_left' || 
    ad.position === 'ads_page_both'
  );
  
  // Right side gets ads where position includes right or both
  const rightAds = allAds.filter(ad => 
    ad.position === 'right' || 
    ad.position === 'both' || 
    ad.position === 'ads_page_right' || 
    ad.position === 'ads_page_both'
  );

  // 10. Extract Video Ads for Homepage content section
  const homepageVideoAds = allAds.filter(ad => 
    ad.media_type === 'video' && 
    ['ads_page', 'ads_page_left', 'ads_page_right', 'ads_page_both'].includes(ad.position)
  );

  return (
    <AdLayoutWrapper leftAds={leftAds} rightAds={rightAds}>
      <div className="w-full md:[&_.container]:w-full md:[&_.container]:max-w-full">
        <HomeReveal settings={settings}>
          <EntityRow title={t("soon")} entities={soonEntities} type="soon" />
          <EntityRow title={t("exclusive")} entities={exclusives} type="exclusive" />
          <EntityRow title={t("todaysEvent")} entities={todaysEvents} type="todays_event" />
          <EntityRow title={t("presenters")} entities={presenters} type="presenter" />
          <EntityRow title={t("podcast")} entities={podcasts} type="podcast" />
          <EntityRow title={t("channels")} entities={channels} type="channel" />
          <EntityRow title={t("guests")} entities={guests} type="guest" />
          <VideoRow title={t("myList")} videos={myListVideos} />
          <AdVideoRow title={t("ads")} ads={homepageVideoAds} />
        </HomeReveal>
      </div>
    </AdLayoutWrapper>
  );
}
