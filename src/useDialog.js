import { useEffect, useRef } from 'react'

export function useDialog(onClose) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const el = ref.current, prev = document.activeElement
    el.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { closeRef.current(); return }
      if (e.key !== 'Tab') return
      const f = el.querySelectorAll('button:not([disabled]), a[href], input')
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (prev && prev.focus) prev.focus()
    }
  }, [])
  return ref
}
