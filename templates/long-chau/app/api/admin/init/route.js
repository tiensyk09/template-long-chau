import { NextResponse } from 'next/server';
import { initDatabase, seedData } from '@/lib/initDb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminPassword = searchParams.get('adminPassword') || undefined;
    const force = searchParams.get('force') === 'true';

    await initDatabase();
    await seedData(adminPassword, force);
    return NextResponse.json({ success: true, message: 'Database initialized and seeded' });
  } catch (err) {
    console.error('Init error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
