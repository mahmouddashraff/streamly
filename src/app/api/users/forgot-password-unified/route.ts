import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Generate 6-digit PIN
    const pin = crypto.randomInt(100000, 999999).toString();
    const hash = crypto.createHash('sha256').update(pin).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // 2. Invalidate existing active codes for this email
    await supabase
      .from('password_reset_codes')
      .update({ verified_at: new Date().toISOString() }) // marking verified invalidates them
      .eq('email', email)
      .is('verified_at', null);

    // 3. Store new PIN hash
    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert({
        email,
        code_hash: hash,
        expires_at: expiresAt,
        attempts: 0
      });

    if (insertError) {
      console.error('Error inserting OTP:', insertError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // 4. Send Email
    // Note: Configure SMTP credentials in .env.local
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@streamly.com',
      to: email,
      subject: 'STREAMLY Password Reset',
      text: `STREAMLY Password Reset\n\nYour password reset verification code is:\n\n${pin}\n\nThis code expires in 10 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // We still return success to not leak email existence or SMTP failures to client
    }

    // Return generic success to avoid email enumeration
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
