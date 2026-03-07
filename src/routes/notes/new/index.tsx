import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Save,
  ChevronLeft,
  Eye,
  PenLine,
  Loader2,
  Languages,
  Lightbulb,
  AlignLeft,
} from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { createNoteFn, incrementActivityCountFn } from '#/db/queries'
import { MarkdownPreview } from '#/components/markdown/MarkdownPreview'
import type { CustomTagName } from '#/components/markdown/MarkdownPreview'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

export const Route = createFileRoute('/notes/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  const createNoteServerFn = useServerFn(createNoteFn)
  const incrementActivity = useServerFn(incrementActivityCountFn)
  const router = useRouter()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await createNoteServerFn({ data: { title, content } })
      await incrementActivity({ data: { amount: 3 } })
      // ルーターのキャッシュを無効化してヘッダーの「草」を再取得させる
      await router.invalidate()
      navigate({ to: '/' })
    } catch (error) {
      console.error('Error creating note:', error)
      alert('メモの保存に失敗しました。')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyAI = (
    aiText: string,
    originalSource: string,
    tagName: CustomTagName,
  ) => {
    setContent((prev) => {
      const escapedSource = originalSource
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .trim()

      // tagName を変数として正規表現に埋め込む
      // これにより ai-translation, ai-explanation, ai-summary すべてに対応可能
      const blockRegex = new RegExp(
        `(::::${tagName}[\\s\\S]*?${escapedSource}[\\s\\S]*?)\\n::::`,
        'm',
      )

      if (!blockRegex.test(prev)) return prev

      return prev.replace(blockRegex, (_, body) => {
        // 最後に固定で付ける閉じタグも、元の構成を維持するために 4つのコロンにする
        return `${body.trimEnd()}\n\n:::result\n${aiText}\n:::\n::::`
      })
    })
  }

  const insertAiTag = (tagName: string) => {
    const tagMap: Record<string, string> = {
      'ai-translation':
        '::::ai-translation\nここに翻訳したいテキストを入力\n::::',
      'ai-explanation':
        '::::ai-explanation\nここに解説したいテキストを入力\n::::',
      'ai-summary': '::::ai-summary\nここに要約したいテキストを入力\n::::',
    }

    setContent((prev) =>
      prev ? `${prev}\n\n${tagMap[tagName]}` : tagMap[tagName],
    )
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-4 flex flex-col justify-center">
      <div className="page-wrap flex flex-col h-[88vh] min-h-[700px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ツールバー */}
        <header className="w-full bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100 h-9 w-9 shrink-0"
                onClick={() => navigate({ to: '/' })}
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </Button>
              <Input
                placeholder="タイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-black border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:bg-transparent pl-4 h-auto w-full max-w-2xl placeholder:text-gray-400 placeholder:opacity-100 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm px-5 h-9 rounded-lg font-medium cursor-pointer"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? '保存中...' : '保存'}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-gray-100 bg-gray-50/10">
            <div className="flex items-center justify-between px-8 pt-4 pb-2">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                <PenLine className="w-3.5 h-3.5" />
                エディター
              </div>

              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-blue-50 text-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
                        onClick={() => insertAiTag('ai-translation')}
                      >
                        <Languages className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-[10px] bg-slate-800 text-white border-none px-2 py-1"
                    >
                      <p>翻訳ブロックを挿入</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-amber-50 text-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
                        onClick={() => insertAiTag('ai-explanation')}
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-[10px] bg-slate-800 text-white border-none px-2 py-1"
                    >
                      <p>解説ブロックを挿入</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-emerald-50 text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer"
                        onClick={() => insertAiTag('ai-summary')}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-[10px] bg-slate-800 text-white border-none px-2 py-1"
                    >
                      <p>要約ブロックを挿入</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="メモを書きましょう"
              className="flex-1 px-8 pt-2 pb-8 resize-none border-none focus-visible:ring-0 text-base leading-relaxed bg-transparent shadow-none placeholder:text-gray-400 placeholder:opacity-100 "
            />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col bg-white">
            <div className="flex items-center gap-2 px-10 pt-4 pb-2 text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">
              <Eye className="w-3.5 h-3.5" />
              プレビュー
            </div>
            <div className="px-10 pt-2 pb-10 prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-pre:bg-gray-900">
              {content ? (
                <MarkdownPreview content={content} onApplyAI={handleApplyAI} />
              ) : (
                <p className="text-gray-300 text-sm">
                  プレビューが表示されます
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
