import { Network, Loader2, Save, Sparkles } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import type { CustomTagName } from './MarkdownPreview'
import ReactMarkdown from 'react-markdown'
import { Mermaid } from './Mermaid'

// テキスト抽出ユーティリティ（共通）
const extractText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (React.isValidElement(node)) {
    const componentName =
      (node.type as any).name || (node.type as any).displayName
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

interface AiDiagramProps {
  children: React.ReactNode
  onApply: (
    aiText: string,
    originalSource: string,
    tagName: CustomTagName,
  ) => void
}

export function AiDiagram({ children, onApply }: AiDiagramProps) {
  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/diagram'),
  })

  const aiResponse = messages
    .filter((m) => m.role === 'assistant')
    .slice(-1)[0]
    ?.parts.map((p: any) => p.text || p.content || '')
    .join('')

  const handleGenerateDiagram = () => {
    const text = extractText(children)
    sendMessage({ content: text })
  }

  return (
    <div className="my-6 rounded-xl border border-indigo-100 overflow-hidden shadow-sm bg-white">
      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest border-b border-indigo-100">
        <Network className="w-3 h-3" />
        AI図解
      </div>

      <div className="px-5 py-4 text-slate-700 text-sm leading-relaxed border-b border-indigo-50/50">
        {children}
        {aiResponse && (
          <div className="mt-4 rounded-lg border border-indigo-100 bg-white overflow-hidden shadow-md animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-600 border-b border-indigo-600">
              <div className="flex items-center gap-1.5 text-white font-bold text-[10px] uppercase tracking-tight">
                <Sparkles className="w-3 h-3" />
                図解
              </div>
              <Button
                onClick={() =>
                  onApply(aiResponse, extractText(children), 'ai-diagram')
                }
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-white/20 text-white rounded-full flex items-center justify-center cursor-pointer transition-all border-none shadow-none"
                title="エディタに保存"
              >
                <Save className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="px-4 py-4 bg-slate-50/50 overflow-x-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-mermaid/.exec(className || '')
                      const chart = String(children).replace(/\n$/, '')

                      if (!inline && match) {
                        return <Mermaid chart={chart} />
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {aiResponse}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="px-4 py-2 bg-white/50 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerateDiagram}
          disabled={isLoading}
          className="h-7 text-[10px] text-indigo-600 gap-1.5 cursor-pointer font-bold transition-colors hover:bg-indigo-50"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Network className="w-3.5 h-3.5" />
          )}
          {isLoading ? '図解中...' : '図解する'}
        </Button>
      </div>
    </div>
  )
}
