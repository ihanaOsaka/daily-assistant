import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const queueTasks = sqliteTable('queue_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  status: text('status').notNull().default('pending'),
  command: text('command').notNull(),
  category: text('category').default('general'),
  priority: integer('priority').default(0),
  result: text('result'),
  error: text('error'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now','localtime'))`),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
});

export type QueueTask = typeof queueTasks.$inferSelect;
export type NewQueueTask = typeof queueTasks.$inferInsert;
