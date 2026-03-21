import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { queueTasks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const taskId = parseInt(id, 10)

    if (isNaN(taskId)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 })
    }

    const [task] = await db
      .select()
      .from(queueTasks)
      .where(eq(queueTasks.id, taskId))

    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    return Response.json(task)
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const taskId = parseInt(id, 10)

    if (isNaN(taskId)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 })
    }

    const [task] = await db
      .select()
      .from(queueTasks)
      .where(eq(queueTasks.id, taskId))

    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.status !== 'pending') {
      return Response.json(
        { error: 'Only pending tasks can be cancelled' },
        { status: 400 }
      )
    }

    await db.delete(queueTasks).where(eq(queueTasks.id, taskId))

    return Response.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
