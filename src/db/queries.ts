import { createServerFn } from "@tanstack/react-start"
import { db } from "."
import z from "zod"
import { activities, notes } from "./schema"
import { eq, sql } from "drizzle-orm"
import { notFound } from "@tanstack/react-router"

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

export const incrementActivityCountFn = createServerFn({ method: 'POST' }).inputValidator(z.object({ amount: z.number().min(1) })).handler(async ({ data }) => {
  // 今日の日付を取得 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]

  await db
    .insert(activities)
    .values({
      date: today,
      count: data.amount,
    })
    .onConflictDoUpdate({
      target: activities.date,
      set: {
        count: sql`${activities.count} + ${data.amount}`,
      },
    })

  return { success: true }
})


export const getNotesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await db.query.notes.findMany({
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
    })
  },
)

export const getNoteByIdFn = createServerFn({ method: 'GET' }).inputValidator(z.object({ id: z.string() })).handler(
  async ({ data }) => {
    const note = await db.query.notes.findFirst({
      where: eq(notes.id, data.id),
    })

    if (note == null) {
      throw notFound();
    }
    return note
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

export const updateNoteFn = createServerFn({ method: 'POST' }).inputValidator(z.object({ id: z.string(), title: z.string(), content: z.string() })).handler(
  async ({ data }) => {
    const { id, title, content } = data
    const updatedNote = await db.update(notes).set({
      title,
      content,
      updatedAt: new Date(),
    }).where(eq(notes.id, id)).returning()

    return updatedNote
  },
)

export const deleteNoteFn = createServerFn({ method: 'POST' }).inputValidator(z.object({ id: z.string() })).handler(
  async ({ data }) => {
    await db.delete(notes).where(eq(notes.id, data.id));
    return { success: true }
  }
)