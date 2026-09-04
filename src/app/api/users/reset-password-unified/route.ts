import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the code again and ensure it was marked as verified recently (within last 10 mins)
    const inputHash = crypto.createHash('sha256').update(code).digest('hex');
    
    // We expect a record that was verified
    const { data: resetRecord, error } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email)
      .eq('code_hash', inputHash)
      .not('verified_at', 'is', null)
      .order('verified_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 400 });
    }

    // Ensure it was verified within the last 15 minutes to allow them time to type password
    const verifiedTime = new Date(resetRecord.verified_at).getTime();
    if (Date.now() - verifiedTime > 15 * 60 * 1000) {
      return NextResponse.json({ error: 'Session expired' }, { status: 400 });
    }

    // Look up the user's UUID securely via RPC
    const { data: userId, error: rpcError } = await supabase
      .rpc('get_user_id_by_email', { email_str: email });

    if (rpcError || !userId) {
      console.error('Failed to resolve user by email:', rpcError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the password using Supabase Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    // Delete the OTP record so it can never be reused
    await supabase
      .from('password_reset_codes')
      .delete()
      .eq('id', resetRecord.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
