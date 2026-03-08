import { AlignLeft, Loader2, Save, Sparkles } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import type { CustomTagName } from './MarkdownPreview'
import ReactMarkdown from 'react-markdown'

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

  if (React.isValidElement(node)) {
    // remark-directive で data.hName = 'result' としているので、displayName や type.name で判定
    const componentName =
      (node.type as any).name || (node.type as any).displayName

    // components オブジェクトで 'result' にマッピングしているため、
    // node.type が AiResult 関数自体であるか、タグ名が 'result' の場合にスキップします
    if (
      componentName === 'AiResult' ||
      (node.props as any).mdast?.name === 'result'
    ) {
      return ''
    }

    return extractText((node.props as any).children)
  }
  return ''
}

interface AiSummaryProps {
  children: React.ReactNode
  onApply: (
    aiText: string,
    originalSource: string,
    tagName: CustomTagName,
  ) => void
}

export function AiSummary({ children, onApply }: AiSummaryProps) {
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
    sendMessage({ content: text })
  }

  return (
    <div className="my-6 rounded-xl border border-emerald-100 overflow-hidden shadow-sm bg-white">
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border-b border-emerald-100">
        <AlignLeft className="w-3 h-3" />
        AI要約
      </div>

      <div className="px-5 py-4 text-slate-700 text-sm leading-relaxed">
        {children}

        {aiResponse && (
          <div className="mt-4 rounded-lg border border-emerald-100 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50/50 border-b border-emerald-50">
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-tight">
                <Sparkles className="w-3 h-3" />
                要約
              </div>
              <Button
                onClick={() =>
                  onApply(aiResponse, extractText(children), 'ai-summary')
                }
                variant="ghost"
                className="h-6 w-6 p-0 bg-transparent hover:bg-emerald-100/50 text-emerald-400 hover:text-emerald-600 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-none border-none"
                title="エディタに保存"
              >
                <Save className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="px-4 py-3">
              <div className="prose prose-sm prose-emerald max-w-none text-slate-800">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-white/50 flex justify-end border-t border-emerald-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSummary}
          disabled={isLoading}
          className="h-7 text-[10px] text-emerald-600 gap-1 cursor-pointer font-bold transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <AlignLeft className="w-3.5 h-3.5" />
          )}
          {isLoading ? '要約中...' : '要約する'}
        </Button>
      </div>
    </div>
  )
}
