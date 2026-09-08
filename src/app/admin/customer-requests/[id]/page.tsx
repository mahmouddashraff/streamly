import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch the request
  const { data: reqData, error } = await supabase
    .from('video_access_requests')
    .select(`
      *,
      video:videos ( id, title_en, title_ar, title, price )
    `)
    .eq('id', id)
    .single();

  if (error || !reqData) {
    return <div className="p-8 text-red-500">Request not found</div>;
  }
  
  const req = reqData as any;

  // Fetch existing grants for this request
  const { data: grants } = await supabase
    .from('video_access_grants')
    .select('*')
    .eq('request_id', req.id)
    .order('granted_at', { ascending: false });

  const activeGrant = grants?.find(g => g.revoked_at === null);

  // Server Actions
  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as string;
    const sb = await createClient();
    
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    
    // Explicit server-side admin check
    const { data: roleData } = await sb.from("user_roles").select("role").eq("user_id", user.id).single();
    if (roleData?.role !== "admin") return;

    await sb.from('video_access_requests')
      .update({ status: newStatus })
      .eq('id', id);
      
    revalidatePath(`/admin/customer-requests/${id}`);
  }

  async function grantAccess() {
    "use server";
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    // Explicit server-side admin check
    const { data: roleData } = await sb.from("user_roles").select("role").eq("user_id", user.id).single();
    if (roleData?.role !== "admin") return;

    // Check if an active grant already exists for this user and video
    const { data: existing } = await sb.from('video_access_grants')
      .select('id')
      .eq('user_id', req.user_id)
      .eq('video_id', req.video_id)
      .is('revoked_at', null)
      .single();

    if (existing) return;

    await sb.from('video_access_grants').insert({
      user_id: req.user_id,
      video_id: req.video_id,
      request_id: req.id,
      granted_by: user.id
    });

    // Auto update status to paid
    await sb.from('video_access_requests')
      .update({ status: 'paid' })
      .eq('id', req.id);

    revalidatePath(`/admin/customer-requests/${id}`);
  }

  async function revokeAccess() {
    "use server";
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    // Explicit server-side admin check
    const { data: roleData } = await sb.from("user_roles").select("role").eq("user_id", user.id).single();
    if (roleData?.role !== "admin") return;
    
    await sb.from('video_access_grants')
      .update({ revoked_at: new Date().toISOString() })
      .eq('request_id', req.id)
      .is('revoked_at', null);

    revalidatePath(`/admin/customer-requests/${id}`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link 
        href="/admin/customer-requests"
        className="flex items-center text-muted-foreground hover:text-white mb-6 w-fit transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Requests
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Request Details</h1>
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
          req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
          req.status === 'contacted' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/50' :
          req.status === 'paid' ? 'bg-green-500/20 text-green-500 border border-green-500/50' :
          'bg-red-500/20 text-red-500 border border-red-500/50'
        }`}>
          {req.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-card border border-border p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-accent border-b border-border pb-2">Customer Info</h2>
          <div className="space-y-3">
            <div><span className="text-muted-foreground block text-xs uppercase">Email</span><span className="font-medium">{req.email}</span></div>
            <div><span className="text-muted-foreground block text-xs uppercase">Mobile</span><span className="font-medium">{req.mobile}</span></div>
            <div><span className="text-muted-foreground block text-xs uppercase">Requested At</span><span className="font-medium">{new Date(req.created_at).toLocaleString()}</span></div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-accent border-b border-border pb-2">Video Info</h2>
          <div className="space-y-3">
            <div><span className="text-muted-foreground block text-xs uppercase">Title</span><span className="font-medium">{req.video?.title_en || req.video?.title_ar || req.video?.title}</span></div>
            <div><span className="text-muted-foreground block text-xs uppercase">Price at Request</span><span className="font-medium text-green-400">${req.price}</span></div>
            <div><span className="text-muted-foreground block text-xs uppercase">Current Video Price</span><span className="font-medium">${req.video?.price}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Workflow & Actions</h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <form action={updateStatus} className="flex-1 space-y-4">
            <label className="block text-sm text-muted-foreground">Change Request Status</label>
            <div className="flex gap-4">
              <select name="status" defaultValue={req.status} className="bg-muted border border-border rounded-md px-3 py-2 text-white flex-1 focus:outline-none focus:border-accent">
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
              <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md font-medium transition-colors border border-white/20">
                Update Status
              </button>
            </div>
          </form>

          <div className="w-px bg-border h-20 hidden md:block"></div>

          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-4">Access Control</label>
            {activeGrant ? (
              <form action={revokeAccess}>
                <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 p-3 rounded-lg mb-4">
                  <CheckCircle className="text-green-500 w-6 h-6" />
                  <div>
                    <p className="text-green-500 font-semibold">Access Granted</p>
                    <p className="text-xs text-green-500/70">Granted on {new Date(activeGrant.granted_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button type="submit" className="w-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-500 px-4 py-2 rounded-md font-medium transition-colors flex justify-center items-center gap-2">
                  <XCircle className="w-4 h-4" /> Revoke Access
                </button>
              </form>
            ) : (
              <form action={grantAccess}>
                <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white px-4 py-3 rounded-md font-bold transition-colors shadow-lg flex justify-center items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Grant Access to Video
                </button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This will immediately grant the user access to play the video.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
