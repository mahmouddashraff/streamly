"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";
import { createClient } from "@/lib/supabase/client";
import * as tus from "tus-js-client";
import { ArrowLeft } from "lucide-react";

type SourceType = "upload" | "external";

export default function AddSoonVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const { id: soon_id } = use(params);
  const [categories, setCategories] = useState<string[]>([]);
  const [postType, setPostType] = useState<"video" | "image">("video");
  
  // Video State
  const [sourceType, setSourceType] = useState<SourceType>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Thumbnail State
  const [thumbnailSourceType, setThumbnailSourceType] = useState<SourceType>("upload");
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

  // Global Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadRef = useRef<tus.Upload | null>(null);
  
  const [formData, setFormData] = useState({
    title_en: "",
    title_ar: "",
    description_en: "",
    description_ar: "",
    thumbnail: "",
    category: "",
    type: "episode" as "movie" | "episode",
    year: new Date().getFullYear().toString(),
    duration: "",
    video_url: "",
    published: true,
    price: 0,
  });

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('name');
      if (data && data.length > 0) {
        setCategories(data.map(c => c.name));
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    }
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, published: !prev.published }));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError("Please select a valid video or audio file.");
        e.target.value = "";
      }
    }
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

    // Validation
    if (postType === "video") {
      if (sourceType === "upload" && !selectedFile) {
        setUploadError("Please select a media file to upload.");
        return;
      }
      if (sourceType === "external" && !formData.video_url) {
        setUploadError("Please provide an external URL.");
        return;
      }
    }
    if (thumbnailSourceType === "upload" && !selectedThumbnailFile) {
      setUploadError(postType === "image" ? "Please select an image to upload." : "Please select a thumbnail image to upload.");
      return;
    }
    if (thumbnailSourceType === "external" && !formData.thumbnail) {
      setUploadError("Please provide an external Thumbnail URL.");
      return;
    }

    setIsUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUploadError("You must be logged in to upload.");
      setIsUploading(false);
      return;
    }

    const newContent: any = {
      ...formData,
      title: formData.title_en,
      description: formData.description_en,
      price: Number(formData.price) || 0,
      soon_id: soon_id,
    };
    if (postType === "video") {
      newContent.year = parseInt(formData.year) || new Date().getFullYear();
    }

    let finalThumbnailUrl = formData.thumbnail;

    try {
      // 1. Upload Thumbnail/Image if applicable
      if (thumbnailSourceType === "upload" && selectedThumbnailFile) {
        const bucketName = "thumbnails";
        const thumbFileName = `${crypto.randomUUID()}-${selectedThumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: thumbError } = await supabase.storage
          .from(bucketName)
          .upload(thumbFileName, selectedThumbnailFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (thumbError) {
          throw new Error(`Thumbnail upload failed: ${thumbError.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(thumbFileName);
        finalThumbnailUrl = publicUrlData.publicUrl;
        if (postType === "image") {
          newContent.image_url = finalThumbnailUrl;
        } else {
          newContent.thumbnail = finalThumbnailUrl;
        }
      } else if (postType === "image" && thumbnailSourceType === "external") {
        newContent.image_url = finalThumbnailUrl;
      }

      if (postType === "image") {
        const { thumbnail, video_url, type, duration, year, category, ...imagePayload } = newContent;
        const { error: dbError } = await supabase.from('soon_images').insert(imagePayload);
        if (dbError) {
          throw new Error("Database error: " + dbError.message);
        } else {
          window.location.href = `/admin/soon/${soon_id}/content`;
        }
        return;
      }

      // 2. Upload Video and Save (Only for postType === "video")
      if (sourceType === "upload" && selectedFile) {
        const fileName = `${crypto.randomUUID()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const bucketName = newContent.price > 0 ? "secure_videos" : "videos";
        const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!projectId) {
           throw new Error("Supabase URL is not configured.");
        }

        const upload = new tus.Upload(selectedFile, {
          endpoint: `${projectId}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'x-upsert': 'true',
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: bucketName,
            objectName: fileName,
            contentType: selectedFile.type,
            cacheControl: "3600",
          },
          chunkSize: 6 * 1024 * 1024,
          onError: async function (error) {
            console.error("Failed because: " + error);
            setUploadError(error.message || "Media upload failed");
            setIsUploading(false);
            
            // Clean up thumbnail if video upload fails
            if (thumbnailSourceType === "upload" && finalThumbnailUrl) {
               await deleteStorageFiles([finalThumbnailUrl]);
            }
          },
          onProgress: function (bytesUploaded, bytesTotal) {
            const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
            setUploadProgress(Number(percentage));
          },
          onSuccess: async function () {
            let finalVideoUrl = "";
            if (bucketName === "videos") {
              const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
              finalVideoUrl = publicUrlData.publicUrl;
            } else {
              finalVideoUrl = `${projectId}/storage/v1/object/authenticated/${bucketName}/${fileName}`;
            }
            newContent.video_url = finalVideoUrl;

            const { error: dbError } = await supabase.from('videos').insert(newContent);

            if (dbError) {
               setUploadError("Database error: " + dbError.message);
               setIsUploading(false);
               await deleteStorageFiles([finalVideoUrl]);
               if (thumbnailSourceType === "upload" && finalThumbnailUrl) {
                 await deleteStorageFiles([finalThumbnailUrl]);
               }
            } else {
               window.location.href = `/admin/soon/${soon_id}/content`;
            }
          },
        });

        uploadRef.current = upload;
        upload.findPreviousUploads().then(function (previousUploads) {
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }
          upload.start();
        });
      } else {
        // External URL for Video
        const { error: dbError } = await supabase.from('videos').insert(newContent);
        if (dbError) {
          throw new Error("Database error: " + dbError.message);
        } else {
          window.location.href = `/admin/soon/${soon_id}/content`;
        }
      }
    } catch (err: any) {
      setUploadError(err.message || "An unexpected error occurred.");
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Soon Content
        </button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Add Content to Soon</h1>
      
      <div className="flex items-center gap-4 mb-6 bg-card border border-border rounded-xl p-4">
        <span className="font-medium">Content Type:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="postType" 
            value="image" 
            checked={postType === "image"} 
            onChange={() => setPostType("image")}
            disabled={isUploading}
            className="accent-accent w-4 h-4"
          />
          <span>Image Only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="postType" 
            value="video" 
            checked={postType === "video"} 
            onChange={() => setPostType("video")}
            disabled={isUploading}
            className="accent-accent w-4 h-4"
          />
          <span>Video</span>
        </label>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title_en" className="text-sm font-medium">Title (English)</label>
              <input
                id="title_en"
                name="title_en"
                required
                disabled={isUploading}
                value={formData.title_en || ""}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50 text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="title_ar" className="text-sm font-medium">Title (Arabic)</label>
              <input
                id="title_ar"
                name="title_ar"
                required
                disabled={isUploading}
                value={formData.title_ar || ""}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50 text-right"
                dir="rtl"
              />
            </div>
            
            {postType === "video" && (
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  disabled={isUploading}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description_en" className="text-sm font-medium">Description (English)</label>
              <textarea
                id="description_en"
                name="description_en"
                required
                disabled={isUploading}
                value={formData.description_en || ""}
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
                value={formData.description_ar || ""}
                onChange={handleChange}
                rows={3}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50 text-right"
                dir="rtl"
              />
            </div>

            {/* Thumbnail/Image Source Section */}
            <div className="space-y-4 md:col-span-2 p-4 border border-border rounded-xl bg-muted/30">
              <label className="text-sm font-medium block mb-2">{postType === "image" ? "Image Post File" : "Video Cover / Thumbnail"}</label>
              
              <div className="flex items-center gap-6 mb-4">
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
                  <span>External Image URL</span>
                </label>
              </div>

              {thumbnailSourceType === "upload" ? (
                <div key="thumb-upload" className="space-y-4">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailFileChange}
                    disabled={isUploading}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover file:cursor-pointer disabled:opacity-50 disabled:file:cursor-not-allowed"
                  />
                  {selectedThumbnailFile && (
                    <div className="text-sm text-muted-foreground bg-black/20 p-3 rounded-md flex items-center gap-4">
                      {thumbnailPreviewUrl && (
                        <img src={thumbnailPreviewUrl} alt="Preview" className="w-24 h-16 object-cover rounded shadow-md" />
                      )}
                      <div>
                        Selected: <strong>{selectedThumbnailFile.name}</strong><br/>
                        ({(selectedThumbnailFile.size / 1024).toFixed(2)} KB)
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div key="thumb-external" className="space-y-2">
                  <input
                    id="thumbnail"
                    name="thumbnail"
                    required={thumbnailSourceType === "external"}
                    disabled={isUploading}
                    value={formData.thumbnail || ""}
                    onChange={handleChange}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              )}
            </div>

            {postType === "video" && (
              <>
                {/* Video Source Section */}
            <div className="space-y-4 md:col-span-2 p-4 border border-border rounded-xl bg-muted/30">
              <label className="text-sm font-medium block mb-2">Media Source (Video/Audio)</label>
              
              <div className="flex items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sourceType" 
                    value="upload" 
                    checked={sourceType === "upload"} 
                    onChange={() => setSourceType("upload")}
                    disabled={isUploading}
                    className="accent-accent w-4 h-4"
                  />
                  <span>Upload Media</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sourceType" 
                    value="external" 
                    checked={sourceType === "external"} 
                    onChange={() => setSourceType("external")}
                    disabled={isUploading}
                    className="accent-accent w-4 h-4"
                  />
                  <span>External URL</span>
                </label>
              </div>

              {sourceType === "upload" ? (
                <div key="video-upload" className="space-y-4">
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleVideoFileChange}
                    disabled={isUploading}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover file:cursor-pointer disabled:opacity-50 disabled:file:cursor-not-allowed"
                  />
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground bg-black/20 p-3 rounded-md">
                      Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Uploading Media...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div key="video-external" className="space-y-2">
                  <input
                    id="video_url"
                    name="video_url"
                    required={sourceType === "external"}
                    disabled={isUploading}
                    value={formData.video_url || ""}
                    onChange={handleChange}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>

            
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Content Type</label>
              <select
                id="type"
                name="type"
                value={formData.type || "movie"}
                onChange={handleChange}
                disabled={isUploading}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="movie">Movie</option>
                <option value="episode">Episode</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-medium">Year</label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  required
                  disabled={isUploading}
                  value={formData.year || ""}
                  onChange={handleChange}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">Duration</label>
                <input
                  id="duration"
                  name="duration"
                  required
                  disabled={isUploading}
                  value={formData.duration || ""}
                  onChange={handleChange}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
                  placeholder="2h 10m"
                />
              </div>
            </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-6 md:col-span-2">
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

            {postType === "video" && (
              <div className="space-y-2 md:col-span-2 pt-4 border-t border-border mt-4">
                <label htmlFor="price" className="text-sm font-medium text-accent">Price (0 for Free Video)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  disabled={isUploading}
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full max-w-xs bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground mt-1">If price &gt; 0, the video will require manual access requests and be stored securely.</p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="text-red-500 text-sm mt-4 p-3 bg-red-500/10 rounded-md border border-red-500/20">
              {uploadError}
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
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                "Publish Content"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
