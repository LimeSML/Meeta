import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { createNoteFn, incrementActivityCountFn } from '#/db/queries'
import { NoteEditorForm } from '#/components/NoteEditorForm'

export const Route = createFileRoute('/notes/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  const incrementActivity = useServerFn(incrementActivityCountFn)
  const createNoteServerFn = useServerFn(createNoteFn)
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: { title: string; content: string }) => {
    setIsSaving(true)
    await createNoteServerFn({ data })
    await incrementActivity({ data: { amount: 3 } })
    navigate({ to: '/' })
    setIsSaving(false)
  }

  return (
    <NoteEditorForm
      initialTitle=""
      initialContent=""
      onSave={handleSave}
      isSaving={isSaving}
    />
  )
}
