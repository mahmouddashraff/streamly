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
      .select(`
        id, 
        title_en, 
        title_ar, 
        title, 
        price,
        category,
        podcasts ( title, title_en, title_ar ),
        channels ( name, name_en, name_ar ),
        guests ( name, name_en, name_ar ),
        presenters ( name, name_en, name_ar ),
        exclusives ( title, title_en, title_ar ),
        todays_events ( title, title_en, title_ar ),
        soon ( title, title_en, title_ar )
      `)
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
    
    let categoryName = video.category || "Unknown Category";
    
    const podcasts: any = video.podcasts;
    const channels: any = video.channels;
    const guests: any = video.guests;
    const presenters: any = video.presenters;
    const exclusives: any = video.exclusives;
    const todays_events: any = video.todays_events;
    const soon: any = video.soon;

    if (podcasts && !Array.isArray(podcasts) || (Array.isArray(podcasts) && podcasts.length > 0)) {
      const p = Array.isArray(podcasts) ? podcasts[0] : podcasts;
      categoryName = `Podcast: ${p.title_en || p.title_ar || p.title}`;
    } else if (channels && !Array.isArray(channels) || (Array.isArray(channels) && channels.length > 0)) {
      const c = Array.isArray(channels) ? channels[0] : channels;
      categoryName = `Channel: ${c.name_en || c.name_ar || c.name}`;
    } else if (guests && !Array.isArray(guests) || (Array.isArray(guests) && guests.length > 0)) {
      const g = Array.isArray(guests) ? guests[0] : guests;
      categoryName = `Guest: ${g.name_en || g.name_ar || g.name}`;
    } else if (presenters && !Array.isArray(presenters) || (Array.isArray(presenters) && presenters.length > 0)) {
      const p = Array.isArray(presenters) ? presenters[0] : presenters;
      categoryName = `Presenter: ${p.name_en || p.name_ar || p.name}`;
    } else if (exclusives && !Array.isArray(exclusives) || (Array.isArray(exclusives) && exclusives.length > 0)) {
      const e = Array.isArray(exclusives) ? exclusives[0] : exclusives;
      categoryName = `Exclusive: ${e.title_en || e.title_ar || e.title}`;
    } else if (todays_events && !Array.isArray(todays_events) || (Array.isArray(todays_events) && todays_events.length > 0)) {
      const t = Array.isArray(todays_events) ? todays_events[0] : todays_events;
      categoryName = `Today's Event: ${t.title_en || t.title_ar || t.title}`;
    } else if (soon && !Array.isArray(soon) || (Array.isArray(soon) && soon.length > 0)) {
      const s = Array.isArray(soon) ? soon[0] : soon;
      categoryName = `Soon: ${s.title_en || s.title_ar || s.title}`;
    }

    const emailResult = await sendAccessRequestEmail({
      customerEmail: user.email,
      customerMobile: mobile,
      videoTitle: videoTitle,
      videoId: video.id,
      price: video.price,
      status: "Pending",
      requestId: requestData.id,
      category: categoryName
    });
    
    console.log("=== RESEND API RESULT ===");
    if (emailResult && emailResult.error) {
      console.log(JSON.stringify({
        data: (emailResult as any).data,
        error: JSON.parse(JSON.stringify(emailResult.error, Object.getOwnPropertyNames(emailResult.error)))
      }, null, 2));
    } else {
      console.log(JSON.stringify(emailResult, null, 2));
    }
    console.log("=========================");

    return NextResponse.json({ success: true, request: requestData });
    
  } catch (error: any) {
    console.error("Access request API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
