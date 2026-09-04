"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { deleteStorageFiles } from "@/app/actions/storage";

export default function AdminSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    site_name: "STREAMLY",
    site_name_en: "watch today's events",
    site_name_ar: "شاهد الحدث اليوم",
    site_description: "Premium Streaming Platform",
    default_language: "ar",
    social_facebook: "",
    social_instagram: "",
    social_youtube: "",
    social_tiktok: "",
    social_twitter: "",
  });

  const [logoEnFile, setLogoEnFile] = useState<File | null>(null);
  const [logoEnPreviewUrl, setLogoEnPreviewUrl] = useState<string | null>(null);
  const [logoArFile, setLogoArFile] = useState<File | null>(null);
  const [logoArPreviewUrl, setLogoArPreviewUrl] = useState<string | null>(null);
  
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to load settings: ${error.message}`);
      }

      if (data) {
        setFormData({
          site_name: data.site_name || "",
          site_name_en: data.site_name_en || "watch today's events",
          site_name_ar: data.site_name_ar || "شاهد الحدث اليوم",
          site_description: data.site_description || "",
          default_language: data.default_language || "ar",
          social_facebook: data.social_facebook || "",
          social_instagram: data.social_instagram || "",
          social_youtube: data.social_youtube || "",
          social_tiktok: data.social_tiktok || "",
          social_twitter: data.social_twitter || "",
        });
        setLogoEnPreviewUrl(data.logo_en_url || null);
        setLogoArPreviewUrl(data.logo_ar_url || null);
        setHeroPreviewUrl(data.hero_background_url || null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoEnFile(file);
      setLogoEnPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleLogoArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoArFile(file);
      setLogoArPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroFile(file);
      setHeroPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let finalLogoEnUrl = logoEnPreviewUrl;
      let finalLogoArUrl = logoArPreviewUrl;
      let finalHeroUrl = heroPreviewUrl;

      // Upload English Logo if changed
      if (logoEnFile) {
        const logoEnName = `logo-en-${Date.now()}-${logoEnFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(logoEnName, logoEnFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw new Error(`English Logo upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabase.storage.from('thumbnails').getPublicUrl(logoEnName);
        finalLogoEnUrl = publicUrlData.publicUrl;
      }

      // Upload Arabic Logo if changed
      if (logoArFile) {
        const logoArName = `logo-ar-${Date.now()}-${logoArFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(logoArName, logoArFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw new Error(`Arabic Logo upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabase.storage.from('thumbnails').getPublicUrl(logoArName);
        finalLogoArUrl = publicUrlData.publicUrl;
      }

      // Upload Hero if changed
      if (heroFile) {
        const heroName = `hero-${Date.now()}-${heroFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(heroName, heroFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw new Error(`Hero background upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabase.storage.from('thumbnails').getPublicUrl(heroName);
        finalHeroUrl = publicUrlData.publicUrl;
      }

      // Save to Database
      const { error: dbError } = await supabase.from('site_settings').upsert({
        id: 1,
        ...formData,
        logo_en_url: finalLogoEnUrl,
        logo_ar_url: finalLogoArUrl,
        hero_background_url: finalHeroUrl,
        updated_at: new Date().toISOString()
      });

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      // Get current settings from DB to know what to delete
      const { data: currentSettings } = await supabase.from('site_settings').select('*').eq('id', 1).single();

      // Delete old files from storage if they were replaced
      const oldFilesToDelete = [];
      if (logoEnFile && currentSettings?.logo_en_url && currentSettings.logo_en_url !== finalLogoEnUrl) {
        oldFilesToDelete.push(currentSettings.logo_en_url);
      }
      if (logoArFile && currentSettings?.logo_ar_url && currentSettings.logo_ar_url !== finalLogoArUrl) {
        oldFilesToDelete.push(currentSettings.logo_ar_url);
      }
      if (heroFile && currentSettings?.hero_background_url && currentSettings.hero_background_url !== finalHeroUrl) {
        oldFilesToDelete.push(currentSettings.hero_background_url);
      }
      
      if (oldFilesToDelete.length > 0) {
        await deleteStorageFiles(oldFilesToDelete);
      }

      setSuccess("Settings saved successfully.");
      
      // Clear file objects so we don't re-upload on next save
      setLogoEnFile(null);
      setLogoArFile(null);
      setHeroFile(null);
      
      // Refresh router state to update layout data if applicable
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-muted-foreground flex items-center justify-center min-h-[60vh]">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-500">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start gap-3 text-green-500">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Site Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-border pb-4">Site Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Site Name (English)</label>
                <input
                  name="site_name_en"
                  required
                  disabled={isSaving}
                  value={formData.site_name_en}
                  onChange={handleChange}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Site Name (Arabic)</label>
                <input
                  name="site_name_ar"
                  required
                  disabled={isSaving}
                  value={formData.site_name_ar}
                  onChange={handleChange}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Language</label>
              <select
                name="default_language"
                disabled={isSaving}
                value={formData.default_language}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
              >
                <option value="en">English (LTR)</option>
                <option value="ar">Arabic (RTL)</option>
              </select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Site Description</label>
              <textarea
                name="site_description"
                disabled={isSaving}
                value={formData.site_description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
                dir="auto"
              />
            </div>

            <div className="space-y-4 md:col-span-2 border-t border-border pt-6 mt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium block">English Logo</label>
                <div className="flex items-center gap-6">
                  {logoEnPreviewUrl ? (
                    <img src={logoEnPreviewUrl} alt="English Logo Preview" className="h-16 object-contain rounded-md bg-black/20 p-2" />
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoEnChange}
                      disabled={isSaving}
                      className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-white hover:file:bg-accent-hover file:transition-colors file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Recommended: PNG, transparent background.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/50">
                <label className="text-sm font-medium block">Arabic Logo</label>
                <div className="flex items-center gap-6">
                  {logoArPreviewUrl ? (
                    <img src={logoArPreviewUrl} alt="Arabic Logo Preview" className="h-16 object-contain rounded-md bg-black/20 p-2" />
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoArChange}
                      disabled={isSaving}
                      className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-white hover:file:bg-accent-hover file:transition-colors file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Recommended: PNG, transparent background.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Homepage Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-border pb-4">Homepage Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium block">Hero Background Image</label>
              <div className="flex items-start gap-6">
                {heroPreviewUrl ? (
                  <img src={heroPreviewUrl} alt="Hero Preview" className="w-64 h-36 object-cover rounded-md border border-border" />
                ) : (
                  <div className="w-64 h-36 rounded-md bg-muted flex items-center justify-center text-muted-foreground border border-border">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
                <div className="flex-1 pt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroChange}
                    disabled={isSaving}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-white hover:file:bg-accent-hover file:transition-colors file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    This image will appear as the global background for the homepage.<br/>
                    Recommended: 1920x1080px (16:9), high quality JPEG or WebP.<br/>
                    This setting explicitly replaces any auto-generated background logic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Social Links */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-border pb-4">Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Facebook URL</label>
              <input
                name="social_facebook"
                type="url"
                placeholder="https://facebook.com/..."
                disabled={isSaving}
                value={formData.social_facebook}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instagram URL</label>
              <input
                name="social_instagram"
                type="url"
                placeholder="https://instagram.com/..."
                disabled={isSaving}
                value={formData.social_instagram}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube URL</label>
              <input
                name="social_youtube"
                type="url"
                placeholder="https://youtube.com/..."
                disabled={isSaving}
                value={formData.social_youtube}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">TikTok URL</label>
              <input
                name="social_tiktok"
                type="url"
                placeholder="https://tiktok.com/@..."
                disabled={isSaving}
                value={formData.social_tiktok}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">X (Twitter) URL</label>
              <input
                name="social_twitter"
                type="url"
                placeholder="https://x.com/..."
                disabled={isSaving}
                value={formData.social_twitter}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Floating Save Action Bar */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-card/80 backdrop-blur-md border-t border-border flex items-center justify-end z-10">
          <div className="max-w-4xl mx-auto w-full flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-md font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-lg"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
