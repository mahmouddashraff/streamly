"use client";

import Link from "next/link";
import { Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";

export default function SoonContentPage({ params }: { params: Promise<{ id: string }> }) {
  const [soon, setSoon] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    // Fetch Soon
    const { data: pData } = await supabase.from('soon').select('*').eq('id', id).single();
    if (pData) setSoon(pData);

    // Fetch associated videos
    const { data: vData } = await supabase.from('videos').select('*').eq('soon_id', id);
    const videos = (vData || []).map(v => ({ ...v, _contentType: 'video' }));

    // Fetch associated images
    const { data: iData } = await supabase.from('soon_images').select('*').eq('soon_id', id);
    const images = (iData || []).map(i => ({ ...i, _contentType: 'image', thumbnail: i.image_url }));

    // Merge and sort
    const merged = [...videos, ...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setContent(merged);
    
    setIsLoading(false);
  }

  const handleDelete = async (itemId: string, title: string, itemType: string, video_url?: string, thumbnail?: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      if (itemType === 'video') {
        const { error } = await supabase.from('videos').delete().eq('id', itemId);
        if (!error) {
          await deleteStorageFiles([video_url, thumbnail].filter(Boolean) as string[]);
          setContent(content.filter(c => c.id !== itemId));
          router.refresh();
        } else {
          alert("Error deleting video");
        }
      } else {
        const { error } = await supabase.from('soon_images').delete().eq('id', itemId);
        if (!error) {
          await deleteStorageFiles([thumbnail].filter(Boolean) as string[]);
          setContent(content.filter(c => c.id !== itemId));
          router.refresh();
        } else {
          alert("Error deleting image post");
        }
      }
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading content...</div>;
  if (!soon) return <div className="p-8 text-red-500">Soon not found</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Soon
        </button>
      </div>

      <div className="flex items-center gap-6 mb-12 bg-card p-6 rounded-xl border border-border">
        <img src={soon.thumbnail} alt={soon.title} className="w-32 h-32 object-cover rounded-lg shadow-md" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{soon.title}</h1>
          <p className="text-muted-foreground max-w-2xl">{soon.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Episodes / Content</h2>
        <Link 
          href={`/admin/soon/${id}/content/new`}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Content
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4 font-medium">Content</th>
              <th className="p-4 font-medium hidden md:table-cell">Type</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {content.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={item.thumbnail} alt={item.title} className="w-16 h-10 object-cover rounded hidden sm:block" />
                    <div className="font-medium text-white flex flex-col">
                      <span>{item.title}</span>
                      {!item.published && <span className="text-xs text-red-400">Draft</span>}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">
                  <span className={`px-2 py-1 text-xs rounded-md ${item._contentType === 'video' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {item._contentType === 'video' ? 'VIDEO' : 'IMAGE'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/soon/${id}/content/${item.id}/edit?contentType=${item._contentType}`}
                      className="p-2 text-muted-foreground hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id, item.title, item._contentType, item.video_url, item.thumbnail)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {content.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  No content found for this soon. Click "Add Content" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
