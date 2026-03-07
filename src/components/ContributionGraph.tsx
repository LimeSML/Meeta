import { cn } from '#/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

type Activity = {
  id: number
  date: string
  count: number
}

export function ContributionGraph({ activities }: { activities: Activity[] }) {
  const last14Days = [...Array(14)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <TooltipProvider>
      <div className="flex gap-1 items-center px-3 py-2 bg-white border rounded-xl shadow-sm">
        {last14Days.map((date) => {
          const record = activities.find((a) => a.date === date)
          const count = record ? record.count : 0

          // yyyy-mm-dd を yyyy/mm/dd に変換
          const displayDate = date.replace(/-/g, '/')

          return (
            <Tooltip key={date}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'h-3 w-3 rounded-[2px] hover:scale-125',
                    count === 0 && 'bg-zinc-200',
                    count > 0 && count <= 2 && 'bg-emerald-300',
                    count > 2 && count <= 5 && 'bg-emerald-500',
                    count > 5 && 'bg-emerald-700',
                  )}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="flex flex-col gap-1 border-zinc-200 px-2 py-1.5 text-[10px] bg-slate-800 text-white shadow-md"
              >
                <span className="font-bold">{count} contributions</span>
                <span className="font-mono">{displayDate}</span>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
