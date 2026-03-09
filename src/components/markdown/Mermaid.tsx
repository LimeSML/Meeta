import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

export const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mermaidの初期化
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    })

    if (ref.current) {
      // 既存のコンテンツをクリアして再描画
      ref.current.removeAttribute('data-processed')
      mermaid.contentLoaded()
    }
  }, [chart])

  return (
    <div
      className="mermaid flex justify-center py-6 my-4 bg-white rounded-lg border border-slate-100 shadow-sm"
      ref={ref}
    >
      {chart}
    </div>
  )
}
