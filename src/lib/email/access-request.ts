import { Resend } from 'resend';

export async function sendAccessRequestEmail(params: {
  customerEmail: string;
  customerMobile: string;
  videoTitle: string;
  videoId: string;
  price: number;
  status: string;
  requestId: string;
  category?: string;
}) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.CONTACT_EMAIL;

    if (!resendApiKey || !adminEmail) {
      console.warn("Resend email configuration is missing. Skipping access request notification.");
      return;
    }

    const resend = new Resend(resendApiKey);

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now);

    const categoryText = params.category ? `\nCategory:\n${params.category}\n` : '';
    const categoryHtml = params.category ? `<p><strong>Category:</strong><br/>${params.category}</p>` : '';

    const textBody = `New Video Access Request — STREAMLY

Customer:
${params.customerEmail}

Mobile:
${params.customerMobile}

Video:
${params.videoTitle}
(ID: ${params.videoId})
${categoryText}
Price:
${params.price}

Status:
${params.status}

Time:
${formattedDate}

Request ID:
${params.requestId}`;

    const htmlBody = `
      <h3>New Video Access Request — STREAMLY</h3>
      <p><strong>Customer:</strong><br/>${params.customerEmail}</p>
      <p><strong>Mobile:</strong><br/>${params.customerMobile}</p>
      <p><strong>Video:</strong><br/>${params.videoTitle} (${params.videoId})</p>
      ${categoryHtml}
      <p><strong>Price:</strong><br/>${params.price}</p>
      <p><strong>Status:</strong><br/>${params.status}</p>
      <p><strong>Time:</strong><br/>${formattedDate}</p>
      <p><strong>Request ID:</strong><br/>${params.requestId}</p>
    `;

    const { error } = await resend.emails.send({
      from: "STREAMLY <onboarding@resend.dev>",
      to: adminEmail,
      subject: "New Video Access Request — STREAMLY",
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error("Failed to send access request email:", error);
    }
  } catch (err) {
    console.error("Error executing sendAccessRequestEmail:", err);
  }
}
