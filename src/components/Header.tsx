import { ClientOnly, Link, useLoaderData } from '@tanstack/react-router'
import { Button } from './ui/button'
import { ContributionGraph } from './ContributionGraph'
import { CurrentTime } from './CurrentTime'

export default function Header() {
  const { activities } = useLoaderData({ from: '__root__' })

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <nav className="page-wrap flex items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="font-semibold">
          <Link
            to="/"
            className="flex items-center rounded-lg bg-primary px-3 py-1.5 transition-colors hover:bg-primary/90"
          >
            <span className="text-lg text-white whitespace-nowrap">Meeta</span>
          </Link>
        </h2>

        <div className="hidden sm:flex items-center gap-4 ml-auto sm:ml-0">
          <ContributionGraph activities={activities} />
          <ClientOnly fallback={<div className="w-16" />}>
            <CurrentTime />
          </ClientOnly>
        </div>

        <div className="ml-auto flex justify-center items-center gap-x-4 text-sm font-semibold whitespace-nowrap">
          <Button asChild variant="outline" size="sm">
            <Link to="/">新規作成</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
