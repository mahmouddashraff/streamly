import { createClient } from "@/lib/supabase/server";

export interface SiteSettings {
  id: number;
  site_name: string;
  site_name_en: string | null;
  site_name_ar: string | null;
  site_description: string;
  site_logo_url: string | null;
  logo_en_url: string | null;
  logo_ar_url: string | null;
  default_language: string;
  social_facebook: string | null;
  social_instagram: string | null;
  social_youtube: string | null;
  social_tiktok: string | null;
  social_twitter: string | null;
  hero_background_url: string | null;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }

  return data;
}
