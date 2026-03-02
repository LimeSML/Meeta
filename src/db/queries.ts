import { createServerFn } from "@tanstack/react-start"
import { db } from "."

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