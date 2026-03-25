import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    const result = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.sort_order), asc(projects.id))

    return Response.json(result)
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, category, status, next_action, notes, repo_path, google_task_id, sort_order } = body

    if (!title || typeof title !== 'string') {
      return Response.json({ error: 'title is required' }, { status: 400 })
    }
    if (!category || typeof category !== 'string') {
      return Response.json({ error: 'category is required' }, { status: 400 })
    }

    const [project] = await db
      .insert(projects)
      .values({
        title,
        category,
        status: status ?? 'active',
        next_action: next_action ?? null,
        notes: notes ?? null,
        repo_path: repo_path ?? null,
        google_task_id: google_task_id ?? null,
        sort_order: sort_order ?? 0,
      })
      .returning()

    return Response.json(project, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
