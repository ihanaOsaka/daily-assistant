import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { queueTasks } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)

    const query = db
      .select()
      .from(queueTasks)
      .orderBy(desc(queueTasks.created_at))
      .limit(limit)

    const tasks = status
      ? await db
          .select()
          .from(queueTasks)
          .where(eq(queueTasks.status, status))
          .orderBy(desc(queueTasks.created_at))
          .limit(limit)
      : await query

    return Response.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { command, category, priority } = body

    if (!command || typeof command !== 'string') {
      return Response.json({ error: 'command is required' }, { status: 400 })
    }

    const [task] = await db
      .insert(queueTasks)
      .values({
        command,
        category: category ?? 'general',
        priority: priority ?? 0,
        status: 'pending',
      })
      .returning()

    return Response.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
