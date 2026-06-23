import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/polls
export async function GET() {
  try {
    const polls = await query('SELECT * FROM polls ORDER BY created_at DESC');
    for (const poll of polls) {
      poll.options = await query(
        'SELECT * FROM poll_options WHERE poll_id = ? ORDER BY sort_order',
        [poll.id]
      );
    }
    return NextResponse.json({ polls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/polls
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { question, options } = await request.json();
    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: 'Cần ít nhất 2 lựa chọn' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO polls (question, active, created_by) VALUES (?,1,?)',
      [question, user.id]
    );
    const pollId = result.insertId;

    for (let i = 0; i < options.length; i++) {
      await query(
        'INSERT INTO poll_options (poll_id, option_text, votes, sort_order) VALUES (?,?,0,?)',
        [pollId, options[i], i + 1]
      );
    }

    const newPoll = await query('SELECT * FROM polls WHERE id = ?', [pollId]);
    newPoll[0].options = await query('SELECT * FROM poll_options WHERE poll_id = ? ORDER BY sort_order', [pollId]);
    return NextResponse.json({ poll: newPoll[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
