import { MarkdownPreview } from '#/components/markdown/MarkdownPreview'
import type { CustomTagName } from '#/components/markdown/MarkdownPreview'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { uploadImageFn } from '#/lib/storage'
import { insertAtCursor } from '#/lib/utils'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import { useServerFn } from '@tanstack/react-start'
import {
  AlignLeft,
  Check,
  ChevronLeft,
  Columns2,
  Eye,
  Image,
  Languages,
  Lightbulb,
  Loader2,
  Network,
  PenLine,
  RefreshCw,
  Save,
} from 'lucide-react'
import { useRef, useState } from 'react'

type ViewMode = 'split' | 'edit' | 'preview'

type NoteEditorFormProps = {
  initialTitle: string
  initialContent: string
  updatedAt?: Date
  onSave: (data: { title: string; content: string }) => Promise<void>
  isSaving: boolean
}

export function NoteEditorForm({
  initialTitle,
  initialContent,
  updatedAt,
  onSave,
  isSaving,
}: NoteEditorFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('split')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadImageServerFn = useServerFn(uploadImageFn)

  const [updateReport, setUpdateReport] = useState<{
    message: string
    isLatest: boolean
  } | null>(null)

  const { sendMessage, isLoading: isChecking } = useChat({
    connection: fetchServerSentEvents('/api/scan'),
    onFinish: (message) => {
      try {
        const text = message.parts
          .map((p: any) => p.text || p.content || '')
          .join('')
        const jsonMatch = text.match(/\{[\s\S]*\}/)

        if (jsonMatch) {
          const report = JSON.parse(jsonMatch[0])
          setUpdateReport({
            message: report.message,
            isLatest: !report.hasUpdate,
          })
        }
      } catch (error) {
        console.error('解析失敗:', error)
      }
    },
  })

  const handleApplyAI = (
    aiText: string,
    originalSource: string,
    tagName: CustomTagName,
  ) => {
    setContent((prev) => {
      const escapedSource = originalSource
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .trim()
      const blockRegex = new RegExp(
        `(::::${tagName}[\\s\\S]*?${escapedSource}[\\s\\S]*?)\\n::::`,
        'm',
      )
      if (!blockRegex.test(prev)) return prev
      return prev.replace(blockRegex, (_, body) => {
        return `${body.trimEnd()}\n\n:::result\n${aiText}\n:::\n::::`
      })
    })
  }

  const handleCheckUpdate = async () => {
    try {
      setUpdateReport(null)
      console.log(content)
      sendMessage({ content: content })
    } catch (e) {
      console.error(e)
    }
  }

  const uploadAndInsertImage = async (file: File) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const placeholder = `![Uploading ${file.name}...]()`
    const contentWithPlaceholder = insertAtCursor(textarea, placeholder)
    setContent(contentWithPlaceholder)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { url, fileName } = await uploadImageServerFn({ data: formData })

      const finalMarkdown = `![${fileName}](${url})`
      setContent((prev) => prev.replace(placeholder, finalMarkdown))
    } catch (error) {
      console.error('アップロード失敗:', error)
      setContent((prev) => prev.replace(placeholder, ''))
      alert('画像のアップロードに失敗しました')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadAndInsertImage(file)
    e.target.value = ''
  }

  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        await uploadAndInsertImage(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          e.preventDefault()
          await uploadAndInsertImage(file)
        }
      }
    }
  }

  const insertAiTag = (tagName: string) => {
    const tagMap: Record<string, string> = {
      'ai-translation':
        '::::ai-translation\nここに翻訳したいテキストを入力\n::::',
      'ai-explanation':
        '::::ai-explanation\nここに解説したいテキストを入力\n::::',
      'ai-summary': '::::ai-summary\nここに要約したいテキストを入力\n::::',
      'ai-diagram':
        '::::ai-diagram\nここに構成図にしたいコードや手順を入力\n::::',
    }

    const newTag = tagMap[tagName]
    if (!newTag) return

    setContent((prev) => (prev ? `${prev}\n\n${newTag}` : newTag))
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-4 flex flex-col justify-center">
      <div className="page-wrap flex flex-col h-[88vh] min-h-[700px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <header className="w-full bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100 h-9 w-9 shrink-0 cursor-pointer"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </Button>
              <Input
                placeholder="タイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-black border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:bg-transparent pl-2 h-auto w-full max-w-2xl placeholder:text-gray-400 truncate transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              {updatedAt && (
                <span className="text-[10px] font-medium text-slate-400 hidden lg:inline whitespace-nowrap">
                  最終更新: {new Date(updatedAt).toLocaleDateString('ja-JP')}
                </span>
              )}

              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/50">
                <TooltipProvider>
                  {[
                    { mode: 'edit', icon: PenLine, label: 'エディター' },
                    { mode: 'split', icon: Columns2, label: '分割表示' },
                    { mode: 'preview', icon: Eye, label: 'プレビュー' },
                  ].map((item) => (
                    <Tooltip key={item.mode}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 rounded-md transition-all cursor-pointer ${
                            viewMode === item.mode
                              ? 'bg-white shadow-sm text-primary'
                              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                          }`}
                          onClick={() => setViewMode(item.mode as ViewMode)}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="text-[10px] bg-slate-800 border-none">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>

              <div className="w-px h-6 bg-slate-200 hidden sm:block" />

              <Button
                onClick={() => onSave({ title, content })}
                disabled={isSaving}
                size="sm"
                className="h-9 px-4 font-bold rounded-lg shadow-sm bg-primary transition-all gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isSaving ? '保存中...' : '保存'}
                </span>
              </Button>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div
            className={`flex-1 flex flex-col border-r border-gray-100 bg-gray-50/10 ${viewMode === 'preview' ? 'hidden' : 'flex'}`}
          >
            <div className="flex items-center justify-between px-8 pt-4 pb-2">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                <PenLine className="w-3.5 h-3.5" />
                エディター
              </div>
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-violet-50 text-violet-500 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-[10px] bg-slate-800 text-white"
                    >
                      画像を挿入
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-blue-50 text-blue-400 cursor-pointer"
                        onClick={() => insertAiTag('ai-translation')}
                      >
                        <Languages className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-[10px] bg-slate-800 text-white"
                    >
                      <p>翻訳ブロックを挿入</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-amber-50 text-amber-400 cursor-pointer"
                        onClick={() => insertAiTag('ai-explanation')}
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-[10px] bg-slate-800 text-white"
                    >
                      <p>解説ブロックを挿入</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-emerald-50 text-emerald-400 cursor-pointer"
                        onClick={() => insertAiTag('ai-summary')}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-[10px] bg-slate-800 text-white"
                    >
                      <p>要約ブロックを挿入</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-indigo-50 text-indigo-600 cursor-pointer"
                        onClick={() => insertAiTag('ai-diagram')}
                      >
                        <Network className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-[10px] bg-slate-800 text-white"
                    >
                      <p>図解ブロックを挿入</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            <Textarea
              ref={textareaRef}
              value={content}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onChange={(e) => setContent(e.target.value)}
              placeholder="メモを書きましょう"
              className="flex-1 px-8 pt-2 pb-8 resize-none border-none focus-visible:ring-0 text-base leading-relaxed bg-transparent shadow-none"
            />
          </div>

          <div
            className={`flex-1 flex flex-col bg-white ${viewMode === 'edit' ? 'hidden' : 'flex'}`}
          >
            <div className="flex items-center justify-between px-10 pt-4 pb-2 border-b border-gray-50 shrink-0">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                <Eye className="w-3.5 h-3.5" />
                プレビュー
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCheckUpdate}
                      disabled={isChecking}
                      className={`h-6 w-6 rounded-full transition-colors cursor-pointer ${
                        isChecking
                          ? 'bg-slate-100 text-slate-400'
                          : 'text-rose-400 hover:text-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      {isChecking ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="text-[10px] bg-slate-800 text-white border-none px-2 py-1"
                  >
                    <p>{isChecking ? 'スキャン中...' : '技術鮮度をチェック'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="relative flex-1 overflow-y-auto">
              {updateReport && (
                <div className="px-10 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div
                    className={`rounded-xl border overflow-hidden shadow-sm bg-white ${
                      updateReport.isLatest
                        ? 'border-slate-200'
                        : 'border-rose-100'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b ${
                        updateReport.isLatest
                          ? 'bg-slate-50 text-slate-500 border-slate-200'
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {updateReport.isLatest ? (
                          <RefreshCw className="w-3 h-3 text-slate-400" />
                        ) : (
                          <RefreshCw className="w-3 h-3 text-rose-400" />
                        )}
                        AIスキャン
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <p className="text-[13px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                        {updateReport.message}
                      </p>
                    </div>

                    <div
                      className={`px-4 py-2 flex justify-end border-t transition-colors ${
                        updateReport.isLatest
                          ? 'bg-slate-50/30 border-slate-100'
                          : 'bg-rose-50/20 border-rose-50'
                      }`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUpdateReport(null)}
                        className={`h-7 text-[10px] font-bold gap-1.5 cursor-pointer shadow-none border-none transition-all ${
                          updateReport.isLatest
                            ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        <>
                          <Check className="w-3.5 h-3.5" />
                          確認しました
                        </>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="px-10 pt-6 pb-10 prose prose-slate max-w-none">
                {content ? (
                  <MarkdownPreview
                    content={content}
                    onApplyAI={handleApplyAI}
                  />
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
    </div>
  )
}
