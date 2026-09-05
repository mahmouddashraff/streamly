import { Resend } from 'resend';

export async function sendLoginNotification(userEmail: string) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.CONTACT_EMAIL;

    if (!resendApiKey || !adminEmail) {
      console.warn("Resend email configuration is missing. Skipping login notification.");
      return;
    }

    const resend = new Resend(resendApiKey);

    const now = new Date();
    // Format: September 5, 2026 at 6:55 PM
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now);

    const textBody = `A user has signed in to STREAMLY.

Email:
${userEmail}

Time:
${formattedDate}

This is an automatic security notification.`;

    const htmlBody = `
      <p>A user has signed in to STREAMLY.</p>
      <p><strong>Email:</strong><br/>${userEmail}</p>
      <p><strong>Time:</strong><br/>${formattedDate}</p>
      <p><small>This is an automatic security notification.</small></p>
    `;

    const { error } = await resend.emails.send({
      from: "STREAMLY <onboarding@resend.dev>",
      to: adminEmail,
      subject: "New User Sign-In — STREAMLY",
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error("Failed to send login notification email:", error);
    }
  } catch (err) {
    console.error("Error executing sendLoginNotification:", err);
  }
}
