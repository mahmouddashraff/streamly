"use client";

import Link from "next/link";
import { Edit, Trash2, Plus, ListVideo } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { deleteStorageFiles } from "@/app/actions/storage";

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchGuests();
  }, []);

  async function fetchGuests() {
    const { data } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
    if (data) setGuests(data);
  }

  const handleDelete = async (id: string, name: string, image_url: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      // 1. Fetch child videos BEFORE deletion
      const { data: childVideos } = await supabase
        .from('videos')
        .select('video_url, thumbnail')
        .eq('guest_id', id);
        
      const childUrls = childVideos ? childVideos.flatMap(v => [v.video_url, v.thumbnail]) : [];
      
      // 2. Delete parent
      const { error } = await supabase.from('guests').delete().eq('id', id);
      
      if (!error) {
        // 3. Clean up storage files
        const allUrlsToDelete = [image_url, ...childUrls].filter(Boolean);
        if (allUrlsToDelete.length > 0) {
          await deleteStorageFiles(allUrlsToDelete as string[]);
        }
        
        setGuests(guests.filter(g => g.id !== id));
        router.refresh();
      } else {
        alert("Error deleting guest");
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
        <Link 
          href="/admin/guests/new"
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Guest
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4 font-medium">Guest</th>
              <th className="p-4 font-medium hidden md:table-cell">Bio</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {guests.map((guest) => (
              <tr key={guest.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={guest.image_url} alt={guest.name} className="w-10 h-10 object-cover rounded-full" />
                    <div className="font-medium text-white">{guest.name}</div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">{guest.bio}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/guests/${guest.id}/content`}
                      className="flex items-center gap-1 p-2 text-sm text-accent hover:text-accent-hover transition-colors bg-accent/10 rounded-md"
                      title="Manage Content"
                    >
                      <ListVideo className="w-4 h-4" />
                      <span className="hidden sm:inline">Manage Content</span>
                    </Link>
                    <Link 
                      href={`/admin/guests/${guest.id}/edit`}
                      className="p-2 text-muted-foreground hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(guest.id, guest.name, guest.image_url)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  No guests found. Click "Add Guest" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
