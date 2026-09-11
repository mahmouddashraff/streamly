"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";
import { createClient } from "@/lib/supabase/client";
import * as tus from "tus-js-client";

type SourceType = "keep" | "upload" | "external";

export default function EditVideoPage({ params }: { params: Promise<{ id: string, video_id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const { id: parentId, video_id: id } = use(params);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Video State
  const [sourceType, setSourceType] = useState<SourceType>("keep");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [originalVideoUrl, setOriginalVideoUrl] = useState("");
  
  // Thumbnail State
  const [thumbnailSourceType, setThumbnailSourceType] = useState<SourceType>("keep");
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [originalThumbnailUrl, setOriginalThumbnailUrl] = useState("");

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
    type: "movie" as "movie" | "episode",
    year: new Date().getFullYear().toString(),
    duration: "",
    video_url: "",
    published: true,
    price: 0,
    });

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: catData } = await supabase.from('categories').select('name');
      if (catData && catData.length > 0) {
        setCategories(catData.map(c => c.name));
      }

      // Fetch video details
      const { data: videoData, error } = await supabase.from('videos').select('*').eq('id', id).single();
      if (videoData && !error) {
        setOriginalVideoUrl(videoData.video_url);
        setOriginalThumbnailUrl(videoData.thumbnail);
        setFormData({
          title_en: videoData.title_en || videoData.title,
          title_ar: videoData.title_ar || videoData.title,
          description_en: videoData.description_en || videoData.description,
          description_ar: videoData.description_ar || videoData.description,
          thumbnail: videoData.thumbnail,
          category: videoData.category || (catData && catData.length > 0 ? catData[0].name : ""),
          type: videoData.type as "movie" | "episode",
          year: videoData.year.toString(),
          duration: videoData.duration,
          video_url: videoData.video_url,
          published: videoData.published,
          price: videoData.price || 0,
          });
      } else {
        alert("Failed to load video data.");
      }
      setIsLoading(false);
    }
    
    fetchData();
  }, [id, supabase]);

  // Cleanup thumbnail preview URL on unmount or when file changes
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
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError("Please select a valid video file.");
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
        // Create a local preview
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
    if (sourceType === "upload" && !selectedFile) {
      setUploadError("Please select a video file to upload.");
      return;
    }
    if (sourceType === "external" && !formData.video_url) {
      setUploadError("Please provide an external Video URL.");
      return;
    }
    if (thumbnailSourceType === "upload" && !selectedThumbnailFile) {
      setUploadError("Please select a thumbnail image to upload.");
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

    const updatedVideo = {
      ...formData,
      title: formData.title_en,
      description: formData.description_en,
      year: parseInt(formData.year) || new Date().getFullYear(),
      price: Number(formData.price) || 0,
      exclusive_id: parentId,
    };

    let finalThumbnailUrl = originalThumbnailUrl;

    try {
      // 1. Process Thumbnail
      if (thumbnailSourceType === "external") {
        finalThumbnailUrl = formData.thumbnail;
      } else if (thumbnailSourceType === "upload" && selectedThumbnailFile) {
        const thumbFileName = `${crypto.randomUUID()}-${selectedThumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: thumbError, data: thumbData } = await supabase.storage
          .from('thumbnails')
          .upload(thumbFileName, selectedThumbnailFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (thumbError) {
          throw new Error(`Thumbnail upload failed: ${thumbError.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from('thumbnails').getPublicUrl(thumbFileName);
        finalThumbnailUrl = publicUrlData.publicUrl;
      }
      
      updatedVideo.thumbnail = finalThumbnailUrl;

      // 2. Process Video
      if (sourceType === "upload" && selectedFile) {
        const fileName = `${crypto.randomUUID()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const bucketName = updatedVideo.price > 0 ? "secure_videos" : "videos";
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
            setUploadError(error.message || "Upload failed");
            setIsUploading(false);
            
            // Clean up newly uploaded thumbnail if video fails
            if (thumbnailSourceType === "upload" && finalThumbnailUrl !== originalThumbnailUrl) {
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
            updatedVideo.video_url = finalVideoUrl;

            const { error: dbError } = await supabase.from('videos').update(updatedVideo).eq('id', id);

            if (dbError) {
               setUploadError("Database error: " + dbError.message);
               setIsUploading(false);
               await deleteStorageFiles([finalVideoUrl]);
               if (thumbnailSourceType === "upload" && finalThumbnailUrl !== originalThumbnailUrl) {
                 await deleteStorageFiles([finalThumbnailUrl]);
               }
            } else {
               if (originalVideoUrl !== updatedVideo.video_url) {
                 await deleteStorageFiles([originalVideoUrl]);
               }
               if (thumbnailSourceType !== "keep" && finalThumbnailUrl !== originalThumbnailUrl) {
                 await deleteStorageFiles([originalThumbnailUrl]);
               }
               window.location.href = `/admin/exclusives/${parentId}/content`;
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
        // Keep or External for Video
        if (sourceType === "keep") {
          // Prevent turning a public video into a paid video without re-uploading
          if (updatedVideo.price > 0 && originalVideoUrl.includes('/public/videos/')) {
            setUploadError("This video is currently stored in the public free bucket. To make it a paid video, you MUST upload it again to move it to the secure bucket.");
            setIsUploading(false);
            return;
          }
          updatedVideo.video_url = originalVideoUrl;
        }
        
        const { error } = await supabase.from('videos').update(updatedVideo).eq('id', id);
        
        if (!error) {
          if (sourceType === "external" && originalVideoUrl !== formData.video_url) {
            await deleteStorageFiles([originalVideoUrl]);
          }
          if (thumbnailSourceType !== "keep" && finalThumbnailUrl !== originalThumbnailUrl) {
            await deleteStorageFiles([originalThumbnailUrl]);
          }
          window.location.href = `/admin/exclusives/${parentId}/content`;
        } else {
          setUploadError("Error updating video: " + error.message);
          setIsUploading(false);
          // Cleanup new thumbnail if DB update fails
          if (thumbnailSourceType === "upload" && finalThumbnailUrl !== originalThumbnailUrl) {
            await deleteStorageFiles([finalThumbnailUrl]);
          }
        }
      }
    } catch (err: any) {
      setUploadError(err.message || "An unexpected error occurred.");
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading video data...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit exclusives Video</h1>
      
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

            {/* Thumbnail Source Section */}
            <div className="space-y-4 md:col-span-2 p-4 border border-border rounded-xl bg-muted/30">
              <label className="text-sm font-medium block mb-2">Thumbnail Source</label>
              
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="thumbnailSourceType" 
                    value="keep" 
                    checked={thumbnailSourceType === "keep"} 
                    onChange={() => setThumbnailSourceType("keep")}
                    disabled={isUploading}
                    className="accent-accent w-4 h-4"
                  />
                  <span>Keep Current Thumbnail</span>
                </label>
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
                  <span>Upload New Image</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="thumbnailSourceType" 
                    value="external" 
                    checked={thumbnailSourceType === "external"} 
                    onChange={() => {
                      setThumbnailSourceType("external");
                      if (formData.thumbnail === originalThumbnailUrl) {
                        setFormData(prev => ({ ...prev, thumbnail: "" }));
                      }
                    }}
                    disabled={isUploading}
                    className="accent-accent w-4 h-4"
                  />
                  <span>External Image URL</span>
                </label>
              </div>

              {thumbnailSourceType === "keep" && (
                <div key="thumb-keep" className="text-sm text-muted-foreground bg-black/20 p-3 rounded-md flex items-center gap-4">
                  {originalThumbnailUrl && (
                    <img src={originalThumbnailUrl} alt="Current" className="w-24 h-16 object-cover rounded shadow-md" />
                  )}
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                    Current: {originalThumbnailUrl}
                  </div>
                </div>
              )}

              {thumbnailSourceType === "upload" && (
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
              )}
              
              {thumbnailSourceType === "external" && (
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

            {/* Video Source Section */}
            <div className="space-y-4 md:col-span-2 p-4 border border-border rounded-xl bg-muted/30">
              <label className="text-sm font-medium block mb-2">Video Source</label>
              
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sourceType" 
                    value="keep" 
                    checked={sourceType === "keep"} 
                    onChange={() => setSourceType("keep")}
                    disabled={isUploading}
                    className="accent-accent w-4 h-4"
                  />
                  <span>Keep Current Video</span>
                </label>
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
                  <span>Upload New Video</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sourceType" 
                    value="external" 
                    checked={sourceType === "external"} 
                    onChange={() => {
                      setSourceType("external");
                      if (formData.video_url === originalVideoUrl) {
                        setFormData(prev => ({ ...prev, video_url: "" }));
                      }
                    }}
                    disabled={isUploading}
                    className="accent-accent w-4 h-4"
                  />
                  <span>External Video URL</span>
                </label>
              </div>

              {sourceType === "keep" && (
                <div key="video-keep" className="text-sm text-muted-foreground bg-black/20 p-3 rounded-md overflow-hidden text-ellipsis whitespace-nowrap">
                  Current: {originalVideoUrl}
                </div>
              )}

              {sourceType === "upload" && (
                <div key="video-upload" className="space-y-4">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
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
                        <span>Uploading Video...</span>
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
              )}
              
              {sourceType === "external" && (
                <div key="video-external" className="space-y-2">
                  <input
                    id="video_url"
                    name="video_url"
                    required={sourceType === "external"}
                    disabled={isUploading}
                    value={formData.video_url || ""}
                    onChange={handleChange}
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-accent disabled:opacity-50"
                    placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                  />
                </div>
              )}

              {uploadError && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-500/10 rounded-md border border-red-500/20">
                  {uploadError}
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

            <div className="grid grid-cols-2 gap-4">
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
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


