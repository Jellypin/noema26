import { useEffect, useState } from 'react'

const LINES = ['They are still out there.', 'Nobody turned off their light.', 'It just went quiet.']

export default function Intro({ onBegin }) {
  const [n, setN] = useState(1)
  useEffect(() => {
    if (n > LINES.length) return
    const t = setTimeout(() => setN((v) => v + 1), 1800)
    return () => clearTimeout(t)
  }, [n])
  return (
    <div className="intro" onClick={onBegin} role="button" tabIndex={0}
      aria-label="Begin. Tap anywhere."
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBegin() }}>
      <span className="badge imagined">imagined</span>
      {LINES.map((l, i) => <p key={l} className={i < n ? 'show' : ''}>{l}</p>)}
      {n > LINES.length && <p className="tap">TAP TO BEGIN</p>}
    </div>
  )
}
