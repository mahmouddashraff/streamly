import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the active reset code for this email
    const { data: resetRecord, error } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email)
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !resetRecord) {
      return NextResponse.json({ error: 'Code expired or invalid' }, { status: 400 });
    }

    // Check attempts
    if (resetRecord.attempts >= 5) {
      // Invalidate it
      await supabase
        .from('password_reset_codes')
        .update({ verified_at: new Date().toISOString() }) 
        .eq('id', resetRecord.id);
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }

    // Verify hash
    const inputHash = crypto.createHash('sha256').update(code).digest('hex');
    
    if (inputHash !== resetRecord.code_hash) {
      // Increment attempts
      await supabase
        .from('password_reset_codes')
        .update({ attempts: resetRecord.attempts + 1 })
        .eq('id', resetRecord.id);
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    // Success - mark as verified. We keep it in DB for the next step (reset password)
    // The reset endpoint will look for a code that is verified_at recently and use it.
    await supabase
      .from('password_reset_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', resetRecord.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Verify reset error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
