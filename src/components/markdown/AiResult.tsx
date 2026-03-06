import { Sparkles } from 'lucide-react'

export function AiResult({ children }: { children: React.ReactNode }) {
  const isEmpty =
    !children || (typeof children === 'string' && children.trim() === '')

  return (
    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/30 overflow-hidden shadow-inner">
      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/50 text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em] border-b border-slate-100">
        <Sparkles
          className={`w-2.5 h-2.5 ${isEmpty ? 'text-slate-200' : 'text-amber-400'}`}
        />
        {isEmpty ? 'No Data' : 'Result'}
      </div>
      <div className="px-4 py-3 text-sm min-h-[3rem] flex items-center">
        {isEmpty ? (
          <span className="text-slate-200 text-xs italic">実行待ち...</span>
        ) : (
          <div className="text-slate-700 whitespace-pre-wrap w-full">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
