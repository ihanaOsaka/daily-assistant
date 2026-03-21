import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTasks } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const body = await request.json();
    const { status, result, error } = body;

    if (!status || !['completed', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'status must be completed or failed' }, { status: 400 });
    }

    const task = await db.select().from(queueTasks).where(eq(queueTasks.id, taskId)).limit(1);
    if (task.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await db.update(queueTasks).set({
      status,
      result: result || null,
      error: error || null,
      completedAt: sql`datetime('now','localtime')`,
    }).where(eq(queueTasks.id, taskId));

    const updated = await db.select().from(queueTasks).where(eq(queueTasks.id, taskId)).limit(1);
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PATCH /api/tasks/[id]/result error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
