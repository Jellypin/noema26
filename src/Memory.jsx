import { useState } from 'react'
import NasaImages from './NasaImages'
import Bench from './Bench'
import { bench } from './data/bench'
import { useDialog } from './useDialog'

const pad = (n) => String(n).padStart(2, '0')

function MissionFile({ m }) {
  return (
    <div className="file">
      <h3>Mission file</h3>
      <dl>
        {m.facts?.map(([k, v]) => (<span key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></span>))}
      </dl>
      <h3>Original sources</h3>
      <ul>
        {m.links?.map(([t, u]) => (
          <li key={u}><a href={u} target="_blank" rel="noreferrer">{t}</a></li>
        ))}
      </ul>
      {m.note && <p className="src">{m.note}</p>}
      <p className="src">Photos come from the NASA Image Library and are credited under each image.</p>
    </div>
  )
}

export default function Memory({ m, revisit, onDone, onSolve, onClose }) {
  const ref = useDialog(onClose)
  const [i, setI] = useState(-1)
  const [seen, setSeen] = useState(0)
  const [tab, setTab] = useState('story')
  const [atBench, setAtBench] = useState(false)
  const total = m.chapters.length, last = total - 1
  const go = (n) => { setI(n); setSeen((s) => Math.max(s, n)); setTab('story') }
  const c = i >= 0 ? m.chapters[i] : null

  return (
    <div className="memory" role="dialog" aria-modal="true" aria-label={m.name} tabIndex={-1} ref={ref}>
      <button className="x" onClick={onClose} aria-label="Close">×</button>
      <h2>{m.name}</h2>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'story'} onClick={() => setTab('story')}>STORY</button>
        <button role="tab" aria-selected={tab === 'file'} onClick={() => setTab('file')}>MISSION FILE</button>
      </div>

      {tab === 'file' && <MissionFile m={m} />}

      {tab === 'story' && i < 0 && (
        <>
          <NasaImages query={m.imageQuery} limit={1} />
          <p className="tagline">{m.tagline}</p>
          <button className="pbtn" onClick={() => go(0)}>Open the record</button>
        </>
      )}

      {tab === 'story' && atBench && <Bench m={m} onSolve={onSolve} onDone={onDone} />}

      {tab === 'story' && c && !atBench && (
        <>
          <div className={`rec ${c.kind}`}>
            <div className="recmeta">
              <span className={`badge ${c.kind}`}>
                {c.kind === 'documented' ? 'HISTORICAL RECORD' : 'IMAGINED TRANSMISSION'}
              </span>
              <span className="count">{pad(i + 1)} / {pad(total)}</span>
            </div>
            <h3>{c.title}</h3>
            {m.photos?.[c.title] && <NasaImages key={m.id + c.title} query={m.photos[c.title]} limit={1} />}
            <p className={c.kind === 'imagined' ? 'letter' : ''}>{c.text}</p>
            <small className="src">Source: {c.source}</small>
          </div>
          <div className="chdots" aria-label="Chapters">
            {m.chapters.map((ch, n) => (
              <button key={ch.title} className={n === i ? 'cur' : ''} disabled={n > seen}
                aria-label={`Chapter ${n + 1}: ${ch.title}`} aria-current={n === i ? 'step' : undefined}
                onClick={() => go(n)} />
            ))}
          </div>
          <div className="nav">
            {i > 0 && <button className="pbtn" onClick={() => go(i - 1)}>Back</button>}
            <button className="pbtn" onClick={() => (i === last ? (revisit ? onClose() : bench[m.id] ? setAtBench(true) : onDone(m)) : go(i + 1))}>
              {i === last ? (revisit ? 'Close' : 'To the bench') : 'Continue'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
