import { useEffect, useState } from 'react'

export function CurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="text-xs font-mono whitespace-nowrap">
      {currentTime.toLocaleTimeString('ja-JP')}
    </span>
  )
}
