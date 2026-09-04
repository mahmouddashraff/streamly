"use client";

import Link from "next/link";
import { Edit, Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Video } from "@/lib/types";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (data) setVideos(data);
  }

  const handleDelete = async (id: string, title: string, video_url: string, thumbnail: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (!error) {
        await deleteStorageFiles([video_url, thumbnail]);
        
        setVideos(videos.filter(v => v.id !== id));
        router.refresh(); // Refresh server caches
      } else {
        alert("Error deleting video");
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4 font-medium">Video</th>
              <th className="p-4 font-medium hidden md:table-cell">Category</th>
              <th className="p-4 font-medium hidden sm:table-cell">Type</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={video.thumbnail} alt={video.title} className="w-16 h-10 object-cover rounded hidden sm:block" />
                    <div>
                      <div className="font-medium text-white">{video.title_en || video.title}</div>
                      <div className="text-xs text-muted-foreground">{video.duration} • {video.year}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">{video.category}</td>
                <td className="p-4 text-muted-foreground hidden sm:table-cell capitalize">{video.type}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${video.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {video.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/videos/${video.id}/edit`}
                      className="p-2 text-muted-foreground hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(video.id, video.title_en || video.title || '', video.video_url, video.thumbnail)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No videos found. Click "Add Video" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
