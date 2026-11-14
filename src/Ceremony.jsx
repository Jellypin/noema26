import { useEffect } from 'react'

export default function Ceremony({ m, onEnd }) {
  useEffect(() => {
    const t = setTimeout(onEnd, 4200)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="ceremony" onClick={onEnd} role="status">
      <p className="cer-name">{m.name}</p>
      {m.ratio ? (
        <>
          <div className="bar" aria-hidden="true">
            <span className="actual" />
            <span className="plan" style={{ width: `${100 / m.ratio}%` }} />
          </div>
          <div className="legend">
            <span>{m.lifetime.planned}</span>
            <span>{m.lifetime.actual}</span>
          </div>
        </>
      ) : null}
      <p className="cer-big">{m.stat.big}</p>
      <p className="cer-small">{m.stat.small}</p>
      <p className="cer-src">{m.stat.source}</p>
    </div>
  )
}
