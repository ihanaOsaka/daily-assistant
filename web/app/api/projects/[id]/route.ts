import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id, 10)

    if (isNaN(projectId)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 })
    }

    const body = await request.json()
    const { status, next_action, notes, repo_path, google_task_id, sort_order, title, category } = body

    const updateData: Record<string, unknown> = {
      updated_at: sql`(current_timestamp)`,
    }

    if (status !== undefined) updateData.status = status
    if (next_action !== undefined) updateData.next_action = next_action
    if (notes !== undefined) updateData.notes = notes
    if (repo_path !== undefined) updateData.repo_path = repo_path
    if (google_task_id !== undefined) updateData.google_task_id = google_task_id
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category

    const [updated] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning()

    if (!updated) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    return Response.json(updated)
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id, 10)

    if (isNaN(projectId)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 })
    }

    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, projectId))
      .returning()

    if (!deleted) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
