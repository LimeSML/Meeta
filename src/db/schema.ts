import { date, integer, pgTable, serial } from 'drizzle-orm/pg-core'

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),
  count: integer('count').default(0).notNull(),
})