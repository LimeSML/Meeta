import { date, integer, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),
  count: integer('count').default(0).notNull(),
})

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull().default('無題のメモ'),
  content: text('content').notNull().default(''),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})