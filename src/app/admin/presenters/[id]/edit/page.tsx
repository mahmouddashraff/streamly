"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";
import { createClient } from "@/lib/supabase/client";

export default function EditPresenterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const { id } = use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name_en: "", name_ar: "", bio_en: "", bio_ar: "", });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error: fetchError } = await supabase.from('presenters').select('*').eq('id', id).single();
      if (data && !fetchError) {
        setFormData({
          name_en: data.name_en || data.name,
          name_ar: data.name_ar || data.name,
          bio_en: data.bio_en || data.bio,
          bio_ar: data.bio_ar || data.bio,
          });
        setOriginalImageUrl(data.image_url);
      } else {
        alert("Failed to load presenter data.");
      }
      setIsLoading(false);
    }
    fetchData();
  }, [id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      let finalImageUrl = originalImageUrl;

      if (selectedFile) {
        const fileName = `${crypto.randomUUID()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.from('presenters').update({
        ...formData,
        name: formData.name_en,
        bio: formData.bio_en,
        image_url: finalImageUrl
      }).eq('id', id);

      if (dbError) {
        // Rollback new file if DB update fails
        if (selectedFile && finalImageUrl !== originalImageUrl) {
           await deleteStorageFiles([finalImageUrl]);
        }
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Cleanup old file if replaced
      if (selectedFile && finalImageUrl !== originalImageUrl && originalImageUrl) {
         await deleteStorageFiles([originalImageUrl]);
      }

      router.push("/admin/presenters");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading presenter data...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Presenter</h1>
      
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (English)</label>
              <input
                name="name_en"
                required
                disabled={isUploading}
                value={formData.name_en}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white text-left"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (Arabic)</label>
              <input
                name="name_ar"
                required
                disabled={isUploading}
                value={formData.name_ar}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white text-right"
                dir="rtl"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio (English)</label>
              <textarea
                name="bio_en"
                required
                disabled={isUploading}
                value={formData.bio_en}
                onChange={handleChange}
                rows={3}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio (Arabic)</label>
              <textarea
                name="bio_ar"
                required
                disabled={isUploading}
                value={formData.bio_ar}
                onChange={handleChange}
                rows={3}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white text-right"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Profile Image</label>
            <div className="flex items-center gap-4 mb-4">
              <img src={previewUrl || originalImageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-full bg-black/20" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-white"
              />
            </div>
            <p className="text-xs text-muted-foreground">Leave empty to keep the current profile image.</p>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex items-center gap-3 pt-4">
            
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isUploading}
              className="px-6 py-2 rounded-md font-medium text-white hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-accent text-white px-6 py-2 rounded-md font-medium hover:bg-accent-hover"
            >
              {isUploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
