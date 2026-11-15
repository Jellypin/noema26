import { useState } from 'react'
import { bench } from './data/bench'

export default function Bench({ m, onSolve, onDone }) {
  const b = bench[m.id]
  const [pick, setPick] = useState(null)
  const picked = pick !== null
  const right = b.kind === 'idea' || pick === b.answer
  const choose = (n) => {
    if (picked) return
    setPick(n)
    onSolve(m.id, b.kind === 'idea' || n === b.answer)
  }
  return (
    <div className="bench">
      <div className="recmeta"><span className="badge documented">ENGINEER’S BENCH</span></div>
      <p className="bq">{b.q}</p>
      <div className="bopts">
        {b.options.map((o, n) => (
          <button key={o} className={`pbtn bopt ${picked ? (b.kind === 'idea' ? (n === pick ? 'right' : '') : n === b.answer ? 'right' : n === pick ? 'wrong' : '') : ''}`}
            disabled={picked} onClick={() => choose(n)}>{o}</button>
        ))}
      </div>
      {picked && (
        <div className="reveal" role="status">
          <p><strong>{b.kind === 'idea' ? 'Good thinking.' : right ? 'Yes.' : 'Not quite.'}</strong> {b.reveal}</p>
          <small className="src">Source: {b.source}</small>
          <div className="nextidea">
            <span className="badge imagined">IMAGINED</span>
            <p>{b.next}</p>
          </div>
          <button className="pbtn" onClick={() => onDone(m)}>Release the light</button>
        </div>
      )}
    </div>
  )
}
