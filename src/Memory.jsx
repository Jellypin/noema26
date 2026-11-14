import { useState } from 'react'
import NasaImages from './NasaImages'

export default function Memory({ m, onDone, onClose }) {
  const [i, setI] = useState(-1)
  const last = m.chapters.length - 1

  if (i < 0) {
    return (
      <div className="memory" role="dialog" aria-label={m.name}>
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        <h2>{m.name}</h2>
        <NasaImages query={m.imageQuery} limit={1} />
        <p className="tagline">{m.tagline}</p>
        <button className="pbtn" onClick={() => setI(0)}>Open the record</button>
      </div>
    )
  }

  const c = m.chapters[i]
  return (
    <div className="memory" role="dialog" aria-label={m.name}>
      <button className="x" onClick={onClose} aria-label="Close">×</button>
      <h2>{m.name} <span className="count">{i + 1}/{m.chapters.length}</span></h2>
      <span className={`badge ${c.kind}`}>{c.kind}</span>
      <h3>{c.title}</h3>
      <p className={c.kind === 'imagined' ? 'letter' : ''}>{c.text}</p>
      <small className="src">Source: {c.source}</small>
      <button className="pbtn" onClick={() => (i === last ? onDone(m) : setI(i + 1))}>
        {i === last ? 'Release the light' : 'Continue'}
      </button>
    </div>
  )
}
