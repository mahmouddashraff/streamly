import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendAccessRequestEmail } from "@/lib/email/access-request";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user from the server-side session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { video_id, mobile } = body;

    if (!video_id || !mobile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Server-side check for the video and its true price
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, title_en, title_ar, title, price')
      .eq('id', video_id)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (!video.price || video.price <= 0) {
      return NextResponse.json({ error: "Video is free, no purchase required" }, { status: 400 });
    }

    // Check for existing pending request to avoid duplicates
    const { data: existingRequest } = await supabase
      .from('video_access_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', video.id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json({ error: "A pending request already exists" }, { status: 409 });
    }

    // Create a service role client to bypass RLS for inserting the request
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create the request
    const { data: requestData, error: insertError } = await supabaseAdmin
      .from('video_access_requests')
      .insert({
        user_id: user.id,
        video_id: video.id,
        email: user.email,
        mobile: mobile,
        price: video.price,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    // Fire and forget email (don't block or fail request if email fails)
    const videoTitle = video.title_en || video.title_ar || video.title || "Unknown Video";
    
    sendAccessRequestEmail({
      customerEmail: user.email,
      customerMobile: mobile,
      videoTitle: videoTitle,
      videoId: video.id,
      price: video.price,
      status: "Pending",
      requestId: requestData.id
    }).catch(e => console.error("Email send failed:", e));

    return NextResponse.json({ success: true, request: requestData });
    
  } catch (error: any) {
    console.error("Access request API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
