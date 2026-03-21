import { MarkdownPreview } from '#/components/markdown/MarkdownPreview'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { deleteNoteFn, getNotesFn } from '#/db/queries'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Calendar, Loader2, StickyNote, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
  loader: () => getNotesFn(),
})

function App() {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  // 削除ダイアログを表示するためのステート
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null)

  const notes = Route.useLoaderData()
  const deleteNoteServerFn = useServerFn(deleteNoteFn)
  const router = useRouter()

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault() // Linkへの遷移を防止
    if (!noteIdToDelete) {
      return
    }

    try {
      setDeletingId(noteIdToDelete)
      await deleteNoteServerFn({ data: { id: noteIdToDelete } })
      await router.invalidate()
      setNoteIdToDelete(null) // ダイアログを閉じる
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('メモの削除に失敗しました。')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-6 sm:py-10">
      <div className="page-wrap">
        {/* ヘッダーエリア ... */}
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              メモ一覧
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {notes.length} 件のメモが見つかりました
            </p>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <StickyNote className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium text-sm">
              メモがまだありません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <Link
                key={note.id}
                to="/notes/$id/edit"
                params={{ id: note.id }}
                className="group block relative"
              >
                <Card className="h-[350px] flex flex-col border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-300 overflow-hidden bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {new Date(note.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-20 relative"
                        onClick={(e) => {
                          e.preventDefault() // Linkへの遷移を防止
                          setNoteIdToDelete(note.id) // ダイアログを開く
                        }}
                        disabled={deletingId === note.id}
                      >
                        {deletingId === note.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                      {note.title || '無題のメモ'}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 px-6 py-2 overflow-hidden relative">
                    <div className="prose prose-sm prose-slate line-clamp-[8] opacity-70 text-slate-600 break-words leading-relaxed">
                      {note.content ? (
                        <MarkdownPreview
                          content={note.content}
                          onApplyAI={() => {}}
                        />
                      ) : (
                        <p className="text-gray-400 text-sm">
                          内容がありません
                        </p>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white via-white/80 to-transparent" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <AlertDialog
          open={!!noteIdToDelete}
          onOpenChange={(open) => !open && setNoteIdToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>メモを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。このメモは完全に削除されます。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                キャンセル
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                onClick={handleDelete}
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
