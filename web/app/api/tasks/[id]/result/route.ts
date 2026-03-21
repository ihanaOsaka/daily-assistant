import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { queueTasks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const taskId = parseInt(id, 10)

    if (isNaN(taskId)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 })
    }

    const body = await request.json()
    const { status, result, error } = body

    if (status !== 'completed' && status !== 'failed') {
      return Response.json(
        { error: 'status must be "completed" or "failed"' },
        { status: 400 }
      )
    }

    const [task] = await db
      .select()
      .from(queueTasks)
      .where(eq(queueTasks.id, taskId))

    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    const completedAt = new Date().toISOString()

    const [updated] = await db
      .update(queueTasks)
      .set({
        status,
        result: result ?? null,
        error: error ?? null,
        completed_at: completedAt,
      })
      .where(eq(queueTasks.id, taskId))
      .returning()

    return Response.json(updated)
  } catch (error) {
    console.error('PATCH /api/tasks/[id]/result error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
