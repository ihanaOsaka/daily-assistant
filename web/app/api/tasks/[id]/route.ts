import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const task = await db.select().from(queueTasks).where(eq(queueTasks.id, taskId)).limit(1);
    if (task.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task[0]);
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const task = await db.select().from(queueTasks).where(eq(queueTasks.id, taskId)).limit(1);
    if (task.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (task[0].status !== 'pending') {
      return NextResponse.json({ error: 'Only pending tasks can be cancelled' }, { status: 400 });
    }
    await db.delete(queueTasks).where(eq(queueTasks.id, taskId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
