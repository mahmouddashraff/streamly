import { createClient } from "@/lib/supabase/server";
import { Film, MonitorPlay, Clapperboard, Layers } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Don't cache admin pages

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  const { data: videos } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
  const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  
  const allVideos = videos || [];
  const moviesCount = allVideos.filter(v => v.type === "movie").length;
  const seriesCount = allVideos.filter(v => v.type === "episode").length;

  const stats = [
    { name: "Total Videos", value: allVideos.length, icon: Film, color: "text-blue-500" },
    { name: "Movies", value: moviesCount, icon: Clapperboard, color: "text-green-500" },
    { name: "Series Episodes", value: seriesCount, icon: MonitorPlay, color: "text-purple-500" },
    { name: "Categories", value: categoryCount || 0, icon: Layers, color: "text-orange-500" },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 md:mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-card border border-border p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{stat.name}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 bg-muted rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold">Recent Videos</h2>
        <Link href="/admin/videos" className="text-sm text-accent hover:underline">
          View all
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4 font-medium">Video</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Year</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allVideos.slice(0, 5).map((video) => (
              <tr key={video.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={video.thumbnail} alt={video.title} className="w-12 h-8 object-cover rounded" />
                    <span className="font-medium text-white">{video.title}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{video.category}</td>
                <td className="p-4 text-muted-foreground">{video.year}</td>
                <td className="p-4 text-muted-foreground capitalize">{video.type}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${video.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {video.published ? 'Published' : 'Draft'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
