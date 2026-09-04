"use client";

import Link from "next/link";
import { Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";

export default function GuestContentPage({ params }: { params: Promise<{ id: string }> }) {
  const [Guest, setGuest] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    // Fetch Guest
    const { data: eData } = await supabase.from('guests').select('*').eq('id', id).single();
    if (eData) setGuest(eData);

    // Fetch associated videos
    const { data: vData } = await supabase.from('videos').select('*').eq('guest_id', id).order('created_at', { ascending: false });
    if (vData) setVideos(vData);
    
    setIsLoading(false);
  }

  const handleDelete = async (videoId: string, title: string, video_url: string, thumbnail: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const { error } = await supabase.from('videos').delete().eq('id', videoId);
      if (!error) {
        await deleteStorageFiles([video_url, thumbnail]);
        
        setVideos(videos.filter(v => v.id !== videoId));
        router.refresh();
      } else {
        alert("Error deleting video");
      }
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading content...</div>;
  if (!Guest) return <div className="p-8 text-red-500">Guest not found</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to guests
        </button>
      </div>

      <div className="flex items-center gap-6 mb-12 bg-card p-6 rounded-xl border border-border">
        <img src={Guest.thumbnail} alt={Guest.title} className="w-32 h-32 object-cover rounded-lg shadow-md" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{Guest.title}</h1>
          <p className="text-muted-foreground max-w-2xl">{Guest.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Videos / Content</h2>
        <Link 
          href={`/admin/guests/${id}/content/new`}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4 font-medium">Video</th>
              <th className="p-4 font-medium hidden md:table-cell">Duration</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={video.thumbnail} alt={video.title} className="w-16 h-10 object-cover rounded hidden sm:block" />
                    <div className="font-medium text-white">{video.title}</div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">{video.duration}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/guests/${id}/content/${video.id}/edit`}
                      className="p-2 text-muted-foreground hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(video.id, video.title, video.video_url, video.thumbnail)}
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
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  No videos found for this Guest. Click "Add Video" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

