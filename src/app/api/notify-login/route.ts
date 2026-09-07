import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { sendLoginNotification } from "@/lib/email/login-notification";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user from the server-side session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user || !user.email) {
      console.error("notify-login API: No valid authenticated user found. Skipping notification.");
      // Return 200 so we don't break the client
      return NextResponse.json({ success: false, message: "No authenticated user" }, { status: 200 });
    }
    
    // Send the email securely using the verified user's email
    await sendLoginNotification(user.email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("notify-login API: Unexpected error:", error);
    // Don't break the login flow
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 200 });
  }
}
