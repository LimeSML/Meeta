import { AlignLeft } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'

const extractText = (node: React.ReactNode): string => {
  if (typeof node === 'string') {
    return node
  }
  if (typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('')
  }
  // React.isValidElement で要素であることを確認し、
  // かつ props が存在し、その中に children があるかをチェック
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children)
  }
  return ''
}

export function AiSummary({ children }: { children: React.ReactNode }) {
  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/summarize'),
  })

  const aiResponse = messages
    .filter((m) => m.role === 'assistant')
    .slice(-1)[0]
    ?.parts.map((p: any) => p.text || p.content || '')
    .join('')

  const handleSummary = () => {
    const text = extractText(children)
    console.log('要約実行:', text)
    sendMessage({ content: text })
  }

  return (
    <div className="my-6 rounded-xl border border-emerald-100 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border-b border-emerald-100">
        <AlignLeft className="w-3 h-3" />
        AI要約
      </div>
      <div className="px-5 py-4 text-slate-700 text-sm leading-relaxed">
        {children}
      </div>
      {aiResponse && (
        <div className="px-5 py-4 bg-white text-slate-800 text-sm animate-in fade-in slide-in-from-top-1 border-t border-emerald-50">
          <div className="font-bold text-[10px] text-emerald-500 mb-2 uppercase tracking-tight flex items-center gap-2">
            <AlignLeft className="w-3 h-3" />
            要約:
          </div>
          <div className="whitespace-pre-wrap leading-relaxed prose prose-sm prose-emerald max-w-none">
            {aiResponse}
          </div>
        </div>
      )}
      <div className="px-4 py-2 bg-white/50 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSummary}
          disabled={isLoading}
          className="h-7 text-[10px] text-emerald-600 hover:bg-emerald-100/50 gap-1 cursor-pointer"
        >
          <AlignLeft className="w-3.5 h-3.5" />
          {isLoading ? '要約中...' : '要約する'}
        </Button>
      </div>
    </div>
  )
}
