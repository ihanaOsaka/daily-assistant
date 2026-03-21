import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTasks } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ensureTable } from '@/lib/db/migrate';

export async function GET() {
  try {
    await ensureTable();
    const pendingCount = await db.select({ count: sql<number>`count(*)` }).from(queueTasks).where(eq(queueTasks.status, 'pending'));
    const processingCount = await db.select({ count: sql<number>`count(*)` }).from(queueTasks).where(eq(queueTasks.status, 'processing'));

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      pending_count: pendingCount[0].count,
      processing_count: processingCount[0].count,
    });
  } catch (error) {
    console.error('GET /api/status error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
