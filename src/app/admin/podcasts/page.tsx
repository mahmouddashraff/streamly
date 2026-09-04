"use client";

import Link from "next/link";
import { Edit, Trash2, Plus, ListVideo } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";

export default function AdminPodcastsPage() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  async function fetchPodcasts() {
    const { data } = await supabase.from('podcasts').select('*').order('created_at', { ascending: false });
    if (data) setPodcasts(data);
  }

  const handleDelete = async (id: string, title: string, thumbnail: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const { error } = await supabase.from('podcasts').delete().eq('id', id);
      if (!error) {
        await deleteStorageFiles([thumbnail]);
        
        setPodcasts(podcasts.filter(v => v.id !== id));
        router.refresh();
      } else {
        alert("Error deleting podcast: " + error.message);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Podcasts</h1>
        <Link 
          href="/admin/podcasts/new"
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Podcast Show
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4 font-medium">Podcast</th>
              <th className="p-4 font-medium hidden md:table-cell">Description</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {podcasts.map((podcast) => (
              <tr key={podcast.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={podcast.thumbnail} alt={podcast.title} className="w-16 h-10 object-cover rounded hidden sm:block" />
                    <div className="font-medium text-white">{podcast.title}</div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">
                  <div className="max-w-[300px] truncate">{podcast.description}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${podcast.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {podcast.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/podcasts/${podcast.id}/content`}
                      className="flex items-center gap-1 p-2 text-sm text-accent hover:text-accent-hover transition-colors bg-accent/10 rounded-md"
                      title="Manage Content"
                    >
                      <ListVideo className="w-4 h-4" />
                      <span className="hidden sm:inline">Manage Content</span>
                    </Link>
                    <Link 
                      href={`/admin/podcasts/${podcast.id}/edit`}
                      className="p-2 text-muted-foreground hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(podcast.id, podcast.title, podcast.thumbnail)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {podcasts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No podcasts found. Click "Add Podcast Show" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
