"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteStorageFiles } from "@/app/actions/storage";

export default function EditAdvertisementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [position, setPosition] = useState("left");
  const [clickBehavior, setClickBehavior] = useState("link");
  const [mediaType, setMediaType] = useState("image");
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState("0");
  
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadAd() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError("Advertisement not found.");
        setIsLoading(false);
        return;
      }

      setName(data.name);
      setDestinationUrl(data.destination_url);
      setPosition(data.position);
      setClickBehavior(data.click_behavior || 'link');
      setMediaType(data.media_type || 'image');
      setActive(data.active);
      setDisplayOrder(data.display_order.toString());
      setCurrentImageUrl(data.image_url);
      
      setIsLoading(false);
    }
    loadAd();
  }, [id, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (mediaType === "video" && file.type.startsWith("video/")) {
        setSelectedFile(file);
        setError(null);
        setPreviewUrl(URL.createObjectURL(file));
      } else if (mediaType === "image" && file.type.startsWith("image/")) {
        setSelectedFile(file);
        setError(null);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setError(`Please select a valid ${mediaType} file.`);
        e.target.value = "";
      }
    }
  };

  // Reset file if media type changes
  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMediaType(e.target.value);
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!destinationUrl.startsWith("http://") && !destinationUrl.startsWith("https://") && !destinationUrl.startsWith("/")) {
      setError("Destination URL must start with http://, https://, or /");
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = currentImageUrl;

      // If they selected a new file, upload it and update url
      if (selectedFile) {
        const fileName = `${crypto.randomUUID()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(`ads/${fileName}`, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('thumbnails').getPublicUrl(`ads/${fileName}`);
        finalImageUrl = publicUrlData.publicUrl;
      }

      // Update database
      const { error: dbError } = await supabase
        .from('advertisements')
        .update({
          name,
          image_url: finalImageUrl,
          destination_url: destinationUrl,
          position,
          click_behavior: clickBehavior,
          media_type: mediaType,
          active,
          display_order: parseInt(displayOrder) || 0
        })
        .eq('id', id);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // If image changed successfully, try to delete the old one
      if (selectedFile && currentImageUrl) {
        try {
          const urlObj = new URL(currentImageUrl);
          const pathParts = urlObj.pathname.split('/');
          const oldFileName = pathParts[pathParts.length - 1];
          if (oldFileName) {
            await supabase.storage.from('thumbnails').remove([`ads/${oldFileName}`]);
            // Also try without ads prefix just in case it was uploaded differently
            await supabase.storage.from('thumbnails').remove([oldFileName]);
          }
        } catch (e) {
          console.error("Failed to cleanup old image, ignoring.", e);
        }
      }

      router.push("/admin/advertisements");
      router.refresh();

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Advertisement</h1>
      
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Advertisement Name</label>
            <input
              id="name"
              type="text"
              required
              disabled={isUploading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
            />
          </div>

          <div className="space-y-4 p-4 border border-border rounded-xl bg-muted/30">
            <div className="space-y-2">
              <label htmlFor="mediaType" className="text-sm font-medium">Media Type</label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={handleMediaTypeChange}
                disabled={isUploading}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <label className="text-sm font-medium block">Current Media</label>
            {currentImageUrl && !previewUrl && (
              <div className="mb-4">
                {mediaType === "video" ? (
                  <video src={currentImageUrl} controls className="max-w-full h-auto max-h-48 rounded border border-white/10" />
                ) : (
                  <img src={currentImageUrl} alt="Current" className="max-w-full h-auto max-h-48 rounded border border-white/10" />
                )}
              </div>
            )}
            
            <label className="text-sm font-medium block">Replace Media (Optional)</label>
            <input
              id="file-upload"
              type="file"
              accept={mediaType === "video" ? "video/*" : "image/*"}
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover file:cursor-pointer disabled:opacity-50"
            />
            {previewUrl && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-xs text-accent mb-2">New Preview:</p>
                {mediaType === "video" ? (
                  <video src={previewUrl} controls className="max-w-full h-auto max-h-48 rounded border border-white/10" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-48 rounded border border-white/10" />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="destinationUrl" className="text-sm font-medium">Destination URL</label>
            <input
              id="destinationUrl"
              type="text"
              required
              disabled={isUploading}
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="position" className="text-sm font-medium">Position</label>
              <select
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                disabled={isUploading}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="left">Left Rail (Desktop)</option>
                <option value="right">Right Rail (Desktop)</option>
                <option value="both">Left & Right Rails (Desktop)</option>
                <option value="ads_page">Ads Page</option>
                <option value="ads_page_left">Ads Page + Left Rail</option>
                <option value="ads_page_right">Ads Page + Right Rail</option>
                <option value="ads_page_both">Ads Page + Left & Right Rails</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="clickBehavior" className="text-sm font-medium">Click Behavior</label>
              <select
                id="clickBehavior"
                value={clickBehavior}
                onChange={(e) => setClickBehavior(e.target.value)}
                disabled={isUploading}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="link">Open Link</option>
                <option value="image">Open Image / Video</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="displayOrder" className="text-sm font-medium">Display Order</label>
              <input
                id="displayOrder"
                type="number"
                required
                disabled={isUploading}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActive(!active)}
              disabled={isUploading}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-accent' : 'bg-muted-foreground'} disabled:opacity-50`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm font-medium">
              {active ? "Active (Visible)" : "Inactive (Hidden)"}
            </span>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-md border border-red-500/20">
              {error}
            </div>
          )}

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
              {isUploading ? "Saving..." : "Save Advertisement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
