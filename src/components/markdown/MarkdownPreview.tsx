import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'
import { Sparkles, Languages, PenLine } from 'lucide-react'
import { Button } from '../ui/button'
import React from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import type { Node, Root } from 'mdast'
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive'

const CUSTOM_TAGS = ['ai-translation', 'ai-explanation', 'ai-sample'] as const
type CustomTagName = (typeof CUSTOM_TAGS)[number]

function isCustomTagName(name: string): name is CustomTagName {
  return (CUSTOM_TAGS as readonly string[]).includes(name)
}

function remarkMyDirectives() {
  return (tree: Root) => {
    visit(tree, (node: Node) => {
      if (node.type === 'containerDirective' || node.type === 'leafDirective') {
        const directive = node as ContainerDirective | LeafDirective

        if (!isCustomTagName(directive.name)) {
          return
        }
        const data = directive.data || (directive.data = {})
        data.hName = directive.name
      }
    })
  }
}

function AiTranslation({ children }: { children: React.ReactNode }) {
  const handleTranslate = () => {
    const text = React.Children.toArray(children).join('') // React要素を文字列化
    console.log('翻訳対象:', text)
  }

  return (
    <div className="my-6 rounded-xl border border-blue-100 bg-blue-50/30 overflow-hidden not-prose">
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border-b border-blue-100">
        <Languages className="w-3 h-3" />
        AI翻訳
      </div>
      <div className="px-5 py-4 text-slate-700 text-sm leading-relaxed">
        {children}
      </div>
      <div className="px-4 py-2 bg-white/50 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTranslate}
          className="h-7 text-[10px] text-blue-600 gap-1 cursor-pointer"
        >
          <Languages className="w-3.5 h-3.5" />
          翻訳する
        </Button>
      </div>
    </div>
  )
}

function AiExplanation({ children }: { children: React.ReactNode }) {
  const handleAction = () => {
    const text = React.Children.toArray(children).join('')
    console.log('解説実行:', text)
  }

  return (
    <div className="my-6 rounded-xl border border-amber-100 bg-amber-50/30 overflow-hidden shadow-sm not-prose">
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest border-b border-amber-100">
        <Sparkles className="w-3 h-3" />
        AI解説
      </div>
      <div className="px-5 py-4 text-slate-700 text-sm leading-relaxed">
        {children}
      </div>
      <div className="px-4 py-2 bg-white/50 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAction}
          className="h-7 text-[10px] text-amber-600 hover:bg-amber-100/50 gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          解説する
        </Button>
      </div>
    </div>
  )
}

function AiSample({ children }: { children: React.ReactNode }) {
  const handleAction = () => {
    const text = React.Children.toArray(children).join('')
    console.log('サンプル実行:', text)
  }

  return (
    <div className="my-6 rounded-xl border border-emerald-100 bg-emerald-50/30 overflow-hidden shadow-sm not-prose">
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border-b border-emerald-100">
        <PenLine className="w-3 h-3" />
        AIサンプル
      </div>
      <div className="px-5 py-4 text-slate-700 text-sm leading-relaxed">
        {children}
      </div>
      <div className="px-4 py-2 bg-white/50 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAction}
          className="h-7 text-[10px] text-emerald-600 hover:bg-emerald-100/50 gap-1 cursor-pointer"
        >
          <PenLine className="w-3.5 h-3.5" />
          サンプルを作る
        </Button>
      </div>
    </div>
  )
}

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkDirective, remarkMyDirectives]}
      components={
        {
          'ai-translation': AiTranslation,
          'ai-explanation': AiExplanation,
          'ai-sample': AiSample,
        } as Components
      }
    >
      {content}
    </ReactMarkdown>
  )
}
