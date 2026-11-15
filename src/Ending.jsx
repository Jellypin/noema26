import { useEffect, useRef, useState } from 'react'
import { machines } from './data/world'

const PTS = [[18, 58], [34, 28], [52, 52], [70, 22], [84, 50], [60, 68], [28, 14]]
const PRESETS = ['A self-cleaning solar panel', 'A machine that repairs itself', 'A rover that leaves no trace']

function wrap(g, text, x, y, maxW, lh) {
  let line = ''
  text.split(' ').forEach((w) => {
    const t = line ? line + ' ' + w : w
    if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); line = w; y += lh }
    else line = t
  })
  g.fillText(line, x, y)
}

function drawCard(c, d) {
  const g = c.getContext('2d'), W = c.width, H = c.height
  g.fillStyle = '#0a0a1f'; g.fillRect(0, 0, W, H)
  for (let i = 0; i < 90; i++) {
    g.globalAlpha = 0.25 + (i % 5) / 8
    g.fillStyle = i % 7 === 0 ? '#ffffff' : '#7fe3c0'
    g.fillRect((i * 97) % W, (i * 53) % H, 3, 3)
  }
  g.globalAlpha = 1
  g.strokeStyle = '#7fe3c0'; g.lineWidth = 6; g.strokeRect(24, 24, W - 48, H - 48)
  g.textAlign = 'center'
  g.fillStyle = '#7fe3c0'; g.font = '20px "Press Start 2P", monospace'
  g.fillText('NOEMA’26', W / 2, 90)
  g.fillStyle = '#dfe8ff'; g.font = '16px "Press Start 2P", monospace'
  g.fillText(d.name ? d.name.toUpperCase() : 'A KEEPER', W / 2, 140)
  g.fillStyle = '#ffd98a'; g.font = '12px "Press Start 2P", monospace'
  g.fillText(`${d.count} LIGHTS KEPT · ${d.solved} PROBLEMS SOLVED`, W / 2, 170)
  const pts = PTS.slice(0, Math.max(d.count, 2)).map(([x, y]) => [60 + x * 4.2, 205 + y * 2])
  g.strokeStyle = '#7fe3c0'; g.lineWidth = 2; g.globalAlpha = 0.6
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke()
  g.globalAlpha = 1; g.fillStyle = '#ffffff'
  pts.forEach(([x, y]) => g.fillRect(x - 5, y - 5, 10, 10))
  g.fillStyle = '#7fe3c0'; g.font = '22px VT323, monospace'
  wrap(g, d.names.join(' · '), W / 2, 375, W - 100, 24)
  g.fillStyle = '#dfe8ff'; g.font = '26px VT323, monospace'
  wrap(g, 'Someone once did this for them. Now it is your turn.', W / 2, 445, W - 100, 26)
  g.fillText('I will build:', W / 2, 520)
  g.fillStyle = '#ffd98a'; g.font = '18px "Press Start 2P", monospace'
  wrap(g, d.what, W / 2, 560, W - 120, 28)
  g.fillStyle = '#dfe8ff'; g.font = '22px VT323, monospace'
  wrap(g, 'The machines explored worlds they could never return from. We are here to remember what they found.', W / 2, 625, W - 100, 22)
  g.fillStyle = '#7fe3c0'; g.font = '10px "Press Start 2P", monospace'
  g.fillText('NASA SPACE APPS 2026', W / 2, 710)
}

export default function Ending({ lit, solved = 0 }) {
  const count = lit.length
  const names = machines.filter((m) => lit.includes(m.id)).map((m) => m.name)
  const pts = PTS.slice(0, Math.max(count, 2))
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [what, setWhat] = useState('')
  const cref = useRef(null)

  useEffect(() => {
    if (step !== 4 || !cref.current) return
    const c = cref.current
    const paint = () => drawCard(c, { name: name.trim(), what, count, names, solved })
    paint()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint)
  }, [step, what, name, count, solved])

  const save = () => {
    const c = cref.current
    const grab = (url, revoke) => {
      const a = document.createElement('a')
      a.href = url; a.download = 'noema-keeper-card.png'
      document.body.appendChild(a); a.click(); a.remove()
      if (revoke) setTimeout(() => URL.revokeObjectURL(url), 3000)
    }
    try {
      c.toBlob((b) => { if (b) grab(URL.createObjectURL(b), true); else grab(c.toDataURL('image/png'), false) }, 'image/png')
    } catch (e) { grab(c.toDataURL('image/png'), false) }
  }
  const next = () => setStep((n) => n + 1)
  const pick = (v) => { setWhat(v); setStep(4) }

  return (
    <div className="ending" role="dialog" aria-modal="true" aria-label="Finale">
      {step === 0 && (
        <>
          <svg className="const" viewBox="0 0 100 80" role="img" aria-label={`${count} lights joined into a constellation`}>
            {pts.slice(1).map(([x, y], i) => (
              <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={x} y2={y}
                style={{ animation: 'fade 1s both', animationDelay: `${i * 0.4 + 0.2}s` }} />
            ))}
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.8" style={{ animation: 'fade 1s both', animationDelay: `${i * 0.4}s` }} />
            ))}
          </svg>
          <span className="badge imagined">IMAGINED TRANSMISSION</span>
          <p className="keeper">Every light you carried is still burning.</p>
          <button className="pbtn" onClick={next}>Continue</button>
        </>
      )}
      {step === 1 && (
        <>
          <div className="earth-dot" aria-hidden="true" />
          <span className="badge documented">HISTORICAL RECORD</span>
          <p className="keeper">In 2004, Spirit looked up from Mars and took the first picture of Earth ever made from the surface of another planet: a faint point of light before dawn.</p>
          <small className="src">Source: NASA/JPL-Caltech/Cornell/Texas A&amp;M, PIA05547</small>
          <button className="pbtn" onClick={next}>Continue</button>
        </>
      )}
      {step === 2 && (
        <>
          <span className="badge imagined">IMAGINED TRANSMISSION</span>
          {['Someone once did this for them.', 'Now it is your turn.', 'What will you build that lasts?'].map((t, i) => (
            <p key={t} className="keeper line" style={{ animationDelay: `${i * 1.3}s` }}>{t}</p>
          ))}
          <button className="pbtn line" style={{ animationDelay: '4s' }} onClick={next}>Answer</button>
        </>
      )}
      {step === 3 && (
        <>
          <label className="keeper" htmlFor="nm">Your name, if you like</label>
          <input id="nm" maxLength={16} value={name} placeholder="Keeper" autoComplete="off"
            onChange={(e) => setName(e.target.value)} />
          <p className="keeper">I will build…</p>
          <div className="choices">
            {PRESETS.map((c) => (
              <button key={c} className="pbtn" onClick={() => pick(c.toLowerCase())}>{c}</button>
            ))}
            <button className="pbtn" onClick={() => setTyping(true)}>My own idea</button>
          </div>
          {typing && (
            <>
              <label className="sr" htmlFor="idea">Your idea</label>
              <input id="idea" maxLength={24} value={custom} placeholder="a rover for the sea" autoComplete="off"
                onChange={(e) => setCustom(e.target.value)} />
              <button className="pbtn" onClick={() => pick(custom.trim() || 'something new')}>Make my card</button>
            </>
          )}
        </>
      )}
      {step === 4 && (
        <>
          <canvas ref={cref} width={540} height={760} className="card" role="img"
            aria-label={`Keeper’s card${name ? ` for ${name}` : ''}: I will build ${what}`} />
          <div className="row">
            <button className="pbtn" onClick={save}>Save my card</button>
            <button className="pbtn" onClick={() => location.reload()}>Walk again</button>
          </div>
          <p className="fine">If the download doesn’t start, press and hold the card to save it.</p>
          <p className="fine">
            Facts come from NASA/JPL, NASA Science, NSSDCA and the NASA Image Library, credited in each memory.
            “Imagined” text is creative writing. Code, sound and draft text were made with SI assistance (Claude).
            Your name and card are made in your browser and are never uploaded.
          </p>
        </>
      )}
    </div>
  )
}
