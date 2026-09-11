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

export const revalidate = 0; // Disable caching to ensure layout updates are immediate

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch Soon Entities
  const { data: soonData } = await supabase
    .from('soon')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  const soonEntities = soonData || [];

  // 2. Fetch Exclusives
  const { data: exclusivesData } = await supabase
    .from('exclusives')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  const exclusives = exclusivesData || [];

  // 3. Fetch Today's Events
  const { data: todaysEventsData } = await supabase
    .from('todays_events')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  const todaysEvents = todaysEventsData || [];

  // 4. Fetch Presenters
  const { data: presentersData } = await supabase
    .from('presenters')
    .select('*')
    .order('created_at', { ascending: false });
  const presenters = presentersData || [];

  // 5. Fetch Podcasts
  const { data: podcastsData } = await supabase
    .from('podcasts')
    .select('*')
    .eq('published', true)
    .eq('is_soon', false)
    .order('created_at', { ascending: false });
  const podcasts = podcastsData || [];

  // 6. Fetch Channels
  const { data: channelsData } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: false });
  const channels = channelsData || [];

  // 7. Fetch Guests
  const { data: guestsData } = await supabase
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false });
  const guests = guestsData || [];

  // 8. Fetch My List if user is logged in
  let myListVideos: Video[] = [];
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
        if (listVideos) myListVideos = listVideos;
      }
    }
  } catch (e) {}

  // Localization
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "ar") as Locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key] || key;

  // Fetch Site Settings
  const settings = await getSiteSettings();

  // 9. Fetch Advertisements
  const { data: adsData } = await supabase
    .from('advertisements')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });
    
  const allAds = (adsData || []) as AdvertisementData[];
  
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

  // The rendering order here explicitly dictates the layout.
  // VideoRow internally checks if videos.length === 0 and returns null if so,
  // naturally hiding empty sections without requiring conditional checks here.
  return (
    <AdLayoutWrapper leftAds={leftAds} rightAds={rightAds}>
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
    </AdLayoutWrapper>
  );
}
