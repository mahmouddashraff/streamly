"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";
import { createClient } from "@/lib/supabase/client";

export default function AddPodcastPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    title_en: "",
    title_ar: "",
    description_en: "",
    description_ar: "",
    thumbnail: "",
    published: true,
    });
  
  const [thumbnailSourceType, setThumbnailSourceType] = useState<"upload" | "external">("upload");
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, published: !prev.published }));
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedThumbnailFile(file);
        setUploadError(null);
        const objectUrl = URL.createObjectURL(file);
        setThumbnailPreviewUrl(objectUrl);
      } else {
        setUploadError("Please select a valid image file for the thumbnail.");
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (thumbnailSourceType === "upload" && !selectedThumbnailFile) {
      setUploadError("Please select a thumbnail image to upload.");
      return;
    }
    if (thumbnailSourceType === "external" && !formData.thumbnail) {
      setUploadError("Please provide an external Thumbnail URL.");
      return;
    }

    setIsUploading(true);

    let finalThumbnailUrl = "";

    try {
      if (thumbnailSourceType === "external") {
        finalThumbnailUrl = formData.thumbnail;
      } else if (thumbnailSourceType === "upload" && selectedThumbnailFile) {
        const thumbFileName = `${crypto.randomUUID()}-${selectedThumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbFileName, selectedThumbnailFile, { cacheControl: '3600', upsert: false });

        if (thumbError) throw new Error(`Thumbnail upload failed: ${thumbError.message}`);

        const { data: publicUrlData } = supabase.storage.from('thumbnails').getPublicUrl(thumbFileName);
        finalThumbnailUrl = publicUrlData.publicUrl;
      }

      const newPodcast = {
        title: formData.title_en,
        description: formData.description_en,
        title_en: formData.title_en,
        title_ar: formData.title_ar,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        thumbnail: finalThumbnailUrl,
        published: formData.published,
        };

      const { error: dbError } = await supabase.from('podcasts').insert(newPodcast);

      if (dbError) {
        if (thumbnailSourceType === "upload" && selectedThumbnailFile) {
           await deleteStorageFiles([finalThumbnailUrl]);
        }
        throw new Error(`Database error: ${dbError.message}`);
      }

      router.push("/admin/podcasts");
      router.refresh();

    } catch (err: any) {
      setUploadError(err.message || "An unexpected error occurred.");
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Podcast Show</h1>
      
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title_en" className="text-sm font-medium">Podcast Title (English)</label>
              <input
                id="title_en"
                name="title_en"
                required
                disabled={isUploading}
                value={formData.title_en}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50 text-left"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="title_ar" className="text-sm font-medium">Podcast Title (Arabic)</label>
              <input
                id="title_ar"
                name="title_ar"
                required
                disabled={isUploading}
                value={formData.title_ar}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50 text-right"
                dir="rtl"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description_en" className="text-sm font-medium">Description (English)</label>
              <textarea
                id="description_en"
                name="description_en"
                required
                disabled={isUploading}
                value={formData.description_en}
                onChange={handleChange}
                rows={3}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50 text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description_ar" className="text-sm font-medium">Description (Arabic)</label>
              <textarea
                id="description_ar"
                name="description_ar"
                required
                disabled={isUploading}
                value={formData.description_ar}
                onChange={handleChange}
                rows={3}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50 text-right"
                dir="rtl"
              />
            </div>

            {/* Thumbnail Source Section */}
            <div className="space-y-4 md:col-span-2 p-4 border border-border rounded-xl bg-muted/30">
              <label className="text-sm font-medium block mb-2">Podcast Cover/Thumbnail</label>
              
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="thumbnailSourceType" 
                    value="upload" 
                    checked={thumbnailSourceType === "upload"} 
                    onChange={() => setThumbnailSourceType("upload")}
                    disabled={isUploading}
                    className="accent-accent w-4 h-4"
                  />
                  <span>Upload Image</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="thumbnailSourceType" 
                    value="external" 
                    checked={thumbnailSourceType === "external"} 
                    onChange={() => setThumbnailSourceType("external")}
                    disabled={isUploading}
                    className="accent-accent w-4 h-4"
                  />
                  <span>External URL</span>
                </label>
              </div>

              {thumbnailSourceType === "upload" && (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailFileChange}
                    disabled={isUploading}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-white"
                  />
                  {selectedThumbnailFile && (
                    <div className="text-sm text-muted-foreground bg-black/20 p-3 rounded-md flex items-center gap-4">
                      {thumbnailPreviewUrl && (
                        <img src={thumbnailPreviewUrl} alt="Preview" className="w-24 h-16 object-cover rounded shadow-md" />
                      )}
                      <div>
                        Selected: <strong>{selectedThumbnailFile.name}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {thumbnailSourceType === "external" && (
                <div className="space-y-2">
                  <input
                    id="thumbnail"
                    name="thumbnail"
                    required={thumbnailSourceType === "external"}
                    disabled={isUploading}
                    value={formData.thumbnail}
                    onChange={handleChange}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 md:col-span-2">
              <button
                type="button"
                onClick={handleToggle}
                disabled={isUploading}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.published ? 'bg-accent' : 'bg-muted-foreground'} disabled:opacity-50`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.published ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-medium w-48">
                {formData.published ? "Published (Visible on site)" : "Draft (Hidden from site)"}
              </span>

              
            </div>

            {uploadError && (
              <div className="text-red-500 text-sm mt-2 md:col-span-2 p-2 bg-red-500/10 rounded-md border border-red-500/20">
                {uploadError}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isUploading}
              className="px-6 py-2 rounded-md font-medium text-white hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-accent text-white px-6 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Saving..." : "Create Podcast"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
