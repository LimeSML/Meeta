import { MarkdownPreview } from '#/components/markdown/MarkdownPreview'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { getNoteByIdFn, updateNoteFn } from '#/db/queries'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ChevronLeft, Eye, Loader2, PenLine, Save } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export const Route = createFileRoute('/notes/$id/edit/')({
  component: RouteComponent,
  loader: ({ params }) => getNoteByIdFn({ data: { id: params.id } }),
})

function RouteComponent() {
  const initialNote = Route.useLoaderData()
  const updateNoteServerFn = useServerFn(updateNoteFn)
  const navigate = useNavigate()

  const [title, setTitle] = useState(initialNote.title)
  const [content, setContent] = useState(initialNote.content)
  const [isSaving, setIsSaving] = useState(false)

  const handleUpdate = async () => {
    try {
      setIsSaving(true)
      await updateNoteServerFn({
        data: {
          id: initialNote.id,
          title,
          content,
        },
      })
      // 更新後は一覧、または詳細ページへ戻る
      navigate({ to: '/' })
    } catch (error) {
      console.error('Error updating note:', error)
      alert('メモの更新に失敗しました。')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-4 flex flex-col justify-center">
      <div className="page-wrap flex flex-col h-[88vh] min-h-[700px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <header className="w-full bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100 h-9 w-9 shrink-0"
                onClick={() => window.history.back()}
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
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                更新:{' '}
                {new Date(initialNote.updatedAt).toLocaleDateString('ja-JP')}
              </span>
              <Button
                className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm px-5 h-9 rounded-lg font-medium cursor-pointer"
                onClick={handleUpdate}
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
            <div className="flex items-center gap-2 px-8 pt-4 pb-2 text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">
              <PenLine className="w-3.5 h-3.5" />
              Editor
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
              Preview
            </div>
            <div className="px-10 pt-2 pb-10 prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-pre:bg-gray-900">
              {content ? (
                <MarkdownPreview content={content} />
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
