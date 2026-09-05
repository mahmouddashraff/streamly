"use server";

import { createClient } from "@/lib/supabase/server";
import { sendLoginNotification } from "@/lib/email/login-notification";

export async function notifyAdminOfLogin() {
  console.log("SERVER ACTION: notifyAdminOfLogin triggered!");
  try {
    const supabase = await createClient();
    
    // Get the authenticated user from the server-side session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user || !user.email) {
      console.error("notifyAdminOfLogin: No valid authenticated user found. Skipping notification.");
      return;
    }
    
    // Send the email securely using the verified user's email
    await sendLoginNotification(user.email);
  } catch (error) {
    console.error("notifyAdminOfLogin: Unexpected error:", error);
  }
}
