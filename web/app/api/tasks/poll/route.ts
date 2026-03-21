import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTasks } from '@/lib/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { ensureTable } from '@/lib/db/migrate';

export async function GET(request: NextRequest) {
  try {
    // API key 認証
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const expectedKey = process.env.POLLER_API_KEY;
    if (expectedKey && key !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureTable();

    // 最古の pending タスクを取得
    const pending = await db.select().from(queueTasks)
      .where(eq(queueTasks.status, 'pending'))
      .orderBy(asc(queueTasks.createdAt))
      .limit(1);

    if (pending.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    // processing に更新
    const task = pending[0];
    await db.update(queueTasks).set({
      status: 'processing',
      startedAt: sql`datetime('now','localtime')`,
    }).where(eq(queueTasks.id, task.id));

    return NextResponse.json({ ...task, status: 'processing' });
  } catch (error) {
    console.error('GET /api/tasks/poll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
