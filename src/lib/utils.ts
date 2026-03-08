import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string
): string {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value

  // 前 + 挿入文字 + 後
  const newValue = value.substring(0, start) + text + value.substring(end)

  // DOMが更新された後にカーソル位置を調整するため、微小な遅延を入れる
  setTimeout(() => {
    textarea.focus()
    const cursorPosition = start + text.length
    textarea.setSelectionRange(cursorPosition, cursorPosition)
  }, 0)

  return newValue
}