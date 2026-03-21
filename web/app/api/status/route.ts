import { db } from '@/lib/db'
import { queueTasks } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

export async function GET() {
  try {
    const [pendingResult] = await db
      .select({ count: count() })
      .from(queueTasks)
      .where(eq(queueTasks.status, 'pending'))

    const [processingResult] = await db
      .select({ count: count() })
      .from(queueTasks)
      .where(eq(queueTasks.status, 'processing'))

    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
      pending_count: pendingResult?.count ?? 0,
      processing_count: processingResult?.count ?? 0,
    })
  } catch (error) {
    console.error('GET /api/status error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
