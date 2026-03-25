import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const queueTasks = sqliteTable('queue_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  status: text('status').notNull().default('pending'),
  command: text('command').notNull(),
  category: text('category').default('general'),
  priority: integer('priority').default(0),
  result: text('result'),
  error: text('error'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  started_at: text('started_at'),
  completed_at: text('completed_at'),
})

export type QueueTask = typeof queueTasks.$inferSelect
export type NewQueueTask = typeof queueTasks.$inferInsert

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'marketing' | 'production' | 'operation'
  status: text('status').notNull().default('active'), // 'urgent' | 'active' | 'waiting' | 'talking' | 'paused' | 'completed'
  next_action: text('next_action'),
  notes: text('notes'),
  repo_path: text('repo_path'),
  google_task_id: text('google_task_id'),
  sort_order: integer('sort_order').default(0),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  created_at: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
