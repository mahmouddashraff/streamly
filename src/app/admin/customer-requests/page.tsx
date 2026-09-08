import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CustomerRequestsPage() {
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from('video_access_requests')
    .select(`
      id,
      email,
      mobile,
      price,
      status,
      created_at,
      video:videos (
        title_en,
        title_ar,
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Customer Requests</h1>
        <div className="text-red-500">Error loading requests: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Customer Requests</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Video</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests && requests.length > 0 ? (
                requests.map((reqRow) => {
                  const req = reqRow as any;
                  return (
                  <tr key={req.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{req.email}</td>
                    <td className="px-6 py-4">{req.mobile}</td>
                    <td className="px-6 py-4 truncate max-w-[200px]" title={req.video?.title_en || req.video?.title_ar || req.video?.title}>
                      {req.video?.title_en || req.video?.title_ar || req.video?.title || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-bold">${req.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        req.status === 'contacted' ? 'bg-blue-500/20 text-blue-500' :
                        req.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/customer-requests/${req.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
