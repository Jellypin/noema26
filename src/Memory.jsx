import { useState } from 'react'
import NasaImages from './NasaImages'

export default function Memory({ m, onDone, onClose }) {
  const [i, setI] = useState(0)
  const c = m.chapters[i]
  const last = i === m.chapters.length - 1
  return (
    <div className="memory">
      <button className="x" onClick={onClose} aria-label="Close">×</button>
      <h2>{m.name}</h2>
      {i === 0 && <NasaImages query={m.imageQuery} />}
      <span className={`badge ${c.kind}`}>{c.kind}</span>
      <h3>{c.title}</h3>
      <p>{c.text}</p>
      <small className="src">Source: {c.source}</small>
      <button onClick={() => (last ? onDone() : setI(i + 1))}>
        {last ? 'Release the light' : 'Continue'}
      </button>
    </div>
  )
}