import { createServerFn } from "@tanstack/react-start"
import { db } from "."
import z from "zod"
import { notes } from "./schema"
import { eq } from "drizzle-orm"

export const getActivitiesThirtyDaysFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // YYYY-MM-DD 形式に変換
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0]

    return await db.query.activities.findMany({
      where: (activities, { gte }) => gte(activities.date, dateStr),
      orderBy: (activities, { desc }) => [desc(activities.date)],
    })
  },
)

export const getNotesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await db.query.notes.findMany({
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
    })
  },
)

export const createNoteFn = createServerFn({ method: 'POST' }).inputValidator(z.object({ title: z.string(), content: z.string() })).handler(
  async ({ data }) => {
    const newNote = await db.insert(notes).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return newNote
  },
)

export const deleteNoteFn = createServerFn({ method: 'POST' }).inputValidator(z.object({ id: z.string() })).handler(
  async ({ data }) => {
    await db.delete(notes).where(eq(notes.id, data.id));
    return { success: true }
  }
)