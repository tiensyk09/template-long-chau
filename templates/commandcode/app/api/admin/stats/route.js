import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/admin/stats — Retrieve stats counts for admin dashboard
export async function GET() {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod'); // Mod or admin
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    // 1. Post stats
    const postCounts = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(views) as totalViews
      FROM posts
    `);

    // 2. Newsletter stats (signups table)
    const signupCounts = await query('SELECT COUNT(*) as total FROM signups');

    // 3. User / Member stats
    const userCounts = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN tier = 'Free' THEN 1 ELSE 0 END) as free,
        SUM(CASE WHEN tier = 'Pro' THEN 1 ELSE 0 END) as pro,
        SUM(CASE WHEN tier = 'Enterprise' THEN 1 ELSE 0 END) as enterprise,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'mod' THEN 1 ELSE 0 END) as mods,
        SUM(CASE WHEN role = 'member' THEN 1 ELSE 0 END) as members
      FROM users
    `);

    // 4. Recent posts list
    const recentPosts = await query(
      'SELECT id, title, slug, status, views, created_at FROM posts ORDER BY created_at DESC LIMIT 5'
    );

    // 5. Recent newsletter signups
    const recentSignups = await query(
      'SELECT id, email, created_at FROM signups ORDER BY created_at DESC LIMIT 5'
    );

    return NextResponse.json({
      posts: {
        total: postCounts[0]?.total || 0,
        published: postCounts[0]?.published || 0,
        draft: postCounts[0]?.draft || 0,
        totalViews: postCounts[0]?.totalViews || 0,
      },
      newsletter: {
        total: signupCounts[0]?.total || 0,
      },
      members: {
        total: userCounts[0]?.total || 0,
        free: userCounts[0]?.free || 0,
        pro: userCounts[0]?.pro || 0,
        enterprise: userCounts[0]?.enterprise || 0,
        admins: userCounts[0]?.admins || 0,
        mods: userCounts[0]?.mods || 0,
        members: userCounts[0]?.members || 0,
      },
      recentPosts,
      recentSignups,
    });
  } catch (err) {
    console.error('Stats query error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
