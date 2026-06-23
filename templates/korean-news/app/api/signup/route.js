import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    
    await query('INSERT OR IGNORE INTO signups (email) VALUES (?)', [email]);
    return NextResponse.json({ success: true, message: 'Successfully subscribed to newsletter!' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
