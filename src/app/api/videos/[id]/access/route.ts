import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser();

    // Get video
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, video_url, price')
      .eq('id', id)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Free video: just return the URL
    if (!video.price || video.price <= 0) {
      return NextResponse.json({ url: video.video_url });
    }

    // Paid video: require auth
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check grant
    const { data: grant } = await supabase
      .from('video_access_grants')
      .select('id, expires_at, revoked_at')
      .eq('user_id', user.id)
      .eq('video_id', video.id)
      .is('revoked_at', null)
      .single();

    if (!grant) {
      // Check if there is a pending request
      const { data: request } = await supabase
        .from('video_access_requests')
        .select('status')
        .eq('user_id', user.id)
        .eq('video_id', video.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (request) {
        return NextResponse.json({ error: "Access denied", requestStatus: request.status }, { status: 403 });
      }
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (grant.expires_at && new Date(grant.expires_at) < new Date()) {
      return NextResponse.json({ error: "Access expired" }, { status: 403 });
    }

    // Extract bucket and file path from the stored URL
    let objectPath = video.video_url;
    let targetBucket = "secure_videos"; // Default for paid videos
    let targetFile = objectPath;

    if (objectPath.includes('/storage/v1/object/')) {
        const parts = objectPath.split('/storage/v1/object/')[1].split('/');
        const isUrlPrefix = ['public', 'authenticated', 'sign'].includes(parts[0]);
        const bucketIndex = isUrlPrefix ? 1 : 0;
        
        targetBucket = parts[bucketIndex];
        targetFile = parts.slice(bucketIndex + 1).join('/');
    }

    // Create an admin client to generate the signed URL to bypass storage RLS
    // The server has already securely authorized the user, so it is safe to issue the URL.
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate short-lived signed URL (e.g. 4 hours)
    const { data: signedUrlData, error: signError } = await supabaseAdmin
      .storage
      .from(targetBucket)
      .createSignedUrl(targetFile, 14400); // 4 hours

    if (signError || !signedUrlData) {
      console.error("Signed URL error:", signError);
      return NextResponse.json({ error: "Failed to generate access URL" }, { status: 500 });
    }

    return NextResponse.json({ url: signedUrlData.signedUrl });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
