import { Sparkles } from 'lucide-react'
import React from 'react'

export function AiResult({ children }: { children: React.ReactNode }) {
  const isEmpty =
    !children || (typeof children === 'string' && children.trim() === '')

  return (
    <div className="mt-4 rounded-lg border border-slate-100 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-tight">
          <Sparkles
            className={`w-3 h-3 ${isEmpty ? 'text-slate-200' : 'text-slate-400'}`}
          />
          AIの回答履歴
        </div>
      </div>

      <div className="px-4 py-3 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap prose prose-sm prose-slate max-w-none">
        {isEmpty ? (
          <span className="text-slate-300 text-xs italic">データなし...</span>
        ) : (
          <div className="w-full">{children}</div>
        )}
      </div>
    </div>
  )
}
