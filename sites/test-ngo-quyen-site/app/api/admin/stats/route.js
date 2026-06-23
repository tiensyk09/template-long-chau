import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const [[postStats]] = await Promise.all([
      query('SELECT COUNT(*) as total, SUM(status="published") as published, SUM(status="draft") as draft, SUM(views) as total_views FROM posts'),
    ]);
    const [[pollStats]] = [await query('SELECT COUNT(*) as total, SUM(active=1) as active_count FROM polls')];
    const [[notifStats]] = [await query('SELECT COUNT(*) as total, SUM(active=1) as active_count FROM notifications')];
    const [[fileStats]] = [await query('SELECT COUNT(*) as total FROM files')];
    const [[memberStats]] = [await query('SELECT COUNT(*) as total, SUM(role="admin") as admins, SUM(role="mod") as mods, SUM(role="member") as members FROM users')];
    const [[catStats]] = [await query('SELECT COUNT(*) as total FROM categories')];

    // Posts by category
    const byCategory = await query(
      `SELECT c.name, COUNT(p.id) as count
       FROM categories c LEFT JOIN posts p ON c.id = p.category_id
       GROUP BY c.id, c.name ORDER BY count DESC LIMIT 8`
    );

    // Recent posts
    const recentPosts = await query(
      'SELECT id, title, status, views, created_at FROM posts ORDER BY created_at DESC LIMIT 5'
    );

    return NextResponse.json({
      posts: { total: postStats.total, published: postStats.published, draft: postStats.draft, totalViews: postStats.total_views || 0 },
      polls: { total: pollStats.total, active: pollStats.active_count },
      notifications: { total: notifStats.total, active: notifStats.active_count },
      files: { total: fileStats.total },
      members: { total: memberStats.total, admins: memberStats.admins, mods: memberStats.mods, regular: memberStats.members },
      categories: { total: catStats.total },
      byCategory,
      recentPosts,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
