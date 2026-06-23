import { NextResponse } from 'next/server';
import { initDatabase, seedData } from '@/lib/initDb';

export async function GET() {
  try {
    await initDatabase();
    await seedData();
    return NextResponse.json({ success: true, message: 'Database initialized and seeded' });
  } catch (err) {
    console.error('Init error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
