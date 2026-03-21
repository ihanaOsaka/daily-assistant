import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { queueTasks } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const pollerKey = process.env.POLLER_API_KEY
    if (pollerKey) {
      const key = request.nextUrl.searchParams.get('key')
      if (key !== pollerKey) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // 最古の pending タスクを取得
    const [task] = await db
      .select()
      .from(queueTasks)
      .where(eq(queueTasks.status, 'pending'))
      .orderBy(asc(queueTasks.created_at))
      .limit(1)

    if (!task) {
      return new Response(null, { status: 204 })
    }

    const startedAt = new Date().toISOString()

    const [updated] = await db
      .update(queueTasks)
      .set({
        status: 'processing',
        started_at: startedAt,
      })
      .where(eq(queueTasks.id, task.id))
      .returning()

    return Response.json(updated)
  } catch (error) {
    console.error('GET /api/tasks/poll error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
