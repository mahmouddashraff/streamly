"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Advertisement {
  id: string;
  name: string;
  image_url: string;
  destination_url: string;
  position: string;
  media_type?: string;
  active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdvertisementsAdminPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
    const { data } = await supabase
      .from("advertisements")
      .select("*")
      .order("position", { ascending: true })
      .order("display_order", { ascending: true });
    
    if (data) setAds(data);
    setLoading(false);
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;
    
    // Attempt to delete image from storage
    if (imageUrl) {
      try {
        const urlObj = new URL(imageUrl);
        const pathParts = urlObj.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        if (fileName) {
          await supabase.storage.from("thumbnails").remove([fileName]);
        }
      } catch (e) {
        console.error("Error deleting image from storage:", e);
      }
    }

    await supabase.from("advertisements").delete().eq("id", id);
    fetchAds();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from("advertisements").update({ active: !currentStatus }).eq("id", id);
    fetchAds();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
        <Link 
          href="/admin/advertisements/new" 
          className="bg-accent text-white px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Advertisement
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Advertisement</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Type</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Position</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Destination</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Order</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading advertisements...
                  </td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No advertisements found.
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded overflow-hidden bg-black/20 shrink-0 border border-white/10 relative">
                          {ad.media_type === 'video' ? (
                            <video src={ad.image_url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={ad.image_url} alt={ad.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium">{ad.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {ad.media_type || 'image'}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {ad.position}
                    </td>
                    <td className="px-6 py-4">
                      <a href={ad.destination_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[200px] block">
                        {ad.destination_url}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {ad.display_order}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleActive(ad.id, ad.active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          ad.active 
                            ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {ad.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/advertisements/${ad.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-white hover:bg-muted rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(ad.id, ad.image_url)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
