import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueTasks } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { ensureTable } from '@/lib/db/migrate';

export async function GET(request: NextRequest) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = db.select().from(queueTasks);
    if (status) {
      query = query.where(eq(queueTasks.status, status)) as typeof query;
    }
    const tasks = await query.orderBy(desc(queueTasks.createdAt)).limit(limit);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const body = await request.json();
    const { command, category, priority } = body;

    if (!command || typeof command !== 'string' || command.trim() === '') {
      return NextResponse.json({ error: 'command is required' }, { status: 400 });
    }

    const result = await db.insert(queueTasks).values({
      command: command.trim(),
      category: category || 'general',
      priority: priority || 0,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
