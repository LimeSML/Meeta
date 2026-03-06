import { Languages } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

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

export function AiTranslation({ children }: { children: React.ReactNode }) {
  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/translate'),
  })

  const aiResponse = messages
    .filter((m) => m.role === 'assistant')
    .slice(-1)[0]
    ?.parts.map((p: any) => p.text || p.content || '')
    .join('')

  const handleTranslation = () => {
    const text = extractText(children)
    console.log('翻訳対象:', text)
    sendMessage({ content: text })
  }

  return (
    <div className="my-6 rounded-xl border border-blue-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border-b border-blue-100">
        <Languages className="w-3 h-3" />
        AI翻訳
      </div>
      <div className="px-5 py-4 text-slate-700 text-sm leading-relaxed">
        {children}
      </div>
      {aiResponse && (
        <div className="px-5 py-4 bg-white text-slate-800 text-sm animate-in fade-in slide-in-from-top-1">
          <div className="font-bold text-[10px] text-blue-400 mb-2 uppercase tracking-tight">
            翻訳:
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">
            {aiResponse}
          </div>
        </div>
      )}
      <div className="px-4 py-2 bg-white/50 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTranslation}
          disabled={isLoading}
          className="h-7 text-[10px] text-blue-600 gap-1 cursor-pointer"
        >
          <Languages className="w-3.5 h-3.5" />
          {isLoading ? '翻訳中...' : '翻訳する'}
        </Button>
      </div>
    </div>
  )
}
