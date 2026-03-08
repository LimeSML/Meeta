import { NoteEditorForm } from '#/components/NoteEditorForm'
import { getNoteByIdFn, updateNoteFn } from '#/db/queries'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

export const Route = createFileRoute('/notes/$id/edit/')({
  component: RouteComponent,
  loader: ({ params }) => getNoteByIdFn({ data: { id: params.id } }),
})

function RouteComponent() {
  const note = Route.useLoaderData()
  const updateNoteServerFn = useServerFn(updateNoteFn)
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: { title: string; content: string }) => {
    setIsSaving(true)
    await updateNoteServerFn({ data: { id: note.id, ...data } })
    navigate({ to: '/' })
    setIsSaving(false)
  }

  return (
    <NoteEditorForm
      initialTitle={note.title}
      initialContent={note.content}
      updatedAt={note.updatedAt}
      onSave={handleSave}
      isSaving={isSaving}
    />
  )
}
