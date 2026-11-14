import { useEffect, useRef, useState } from 'react'

const PTS = [[18, 58], [34, 28], [52, 52], [70, 22], [84, 50], [60, 68], [28, 14]]
const PRESETS = ['A rover', 'A telescope', 'A lander']

function wrap(g, text, x, y, maxW, lh) {
  let line = ''
  text.split(' ').forEach((w) => {
    const t = line ? line + ' ' + w : w
    if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); line = w; y += lh }
    else line = t
  })
  g.fillText(line, x, y)
}

function drawCard(c, what, count) {
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
  g.fillText('NOEMA’26', W / 2, 100)
  g.fillStyle = '#dfe8ff'; g.font = '14px "Press Start 2P", monospace'
  g.fillText(`KEEPER OF ${count} LIGHTS`, W / 2, 145)
  const pts = PTS.slice(0, Math.max(count, 2)).map(([x, y]) => [60 + x * 4.2, 190 + y * 2.6])
  g.strokeStyle = '#7fe3c0'; g.lineWidth = 2; g.globalAlpha = 0.6
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke()
  g.globalAlpha = 1; g.fillStyle = '#ffffff'
  pts.forEach(([x, y]) => g.fillRect(x - 5, y - 5, 10, 10))
  g.fillStyle = '#dfe8ff'; g.font = '28px VT323, monospace'
  g.fillText('Someone once did this for them.', W / 2, 460)
  g.fillText('Now it is your turn.', W / 2, 495)
  g.fillText('I will build:', W / 2, 560)
  g.fillStyle = '#ffd98a'; g.font = '18px "Press Start 2P", monospace'
  wrap(g, what, W / 2, 605, W - 120, 30)
  g.fillStyle = '#7fe3c0'; g.font = '22px VT323, monospace'
  g.fillText('Abandoned but not Forgotten', W / 2, H - 80)
  g.fillText('NASA Space Apps Challenge 2026', W / 2, H - 50)
}

export default function Ending({ lit }) {
  const count = lit.length
  const pts = PTS.slice(0, Math.max(count, 2))
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)
  const [custom, setCustom] = useState('')
  const [what, setWhat] = useState('')
  const cref = useRef(null)

  useEffect(() => {
    if (step !== 4 || !cref.current) return
    const c = cref.current
    const paint = () => drawCard(c, what, count)
    paint()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint)
  }, [step, what, count])

  const save = () => {
    cref.current.toBlob((b) => {
      if (!b) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(b); a.download = 'noema-keeper-card.png'; a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    })
  }
  const next = () => setStep((s) => s + 1)

  return (
    <div className="ending">
      {step === 0 && (
        <>
          <svg className="const" viewBox="0 0 100 80" role="img"
            aria-label={`${count} lights joined into a constellation`}>
            {pts.slice(1).map(([x, y], i) => (
              <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={x} y2={y}
                style={{ animation: 'fade 1s both', animationDelay: `${i * 0.4 + 0.2}s` }} />
            ))}
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.8"
                style={{ animation: 'fade 1s both', animationDelay: `${i * 0.4}s` }} />
            ))}
          </svg>
          <span className="badge imagined">imagined</span>
          <p className="keeper">Every light you carried is still burning.</p>
          <button className="pbtn" onClick={next}>Continue</button>
        </>
      )}
      {step === 1 && (
        <>
          <div className="earth-dot" aria-hidden="true" />
          <span className="badge documented">documented</span>
          <p className="keeper">In 2004, Spirit looked up from Mars and took the first picture of Earth ever made from the surface of another planet: a faint point of light before dawn.</p>
          <small className="src">Source: NASA/JPL-Caltech/Cornell/Texas A&amp;M, PIA05547</small>
          <button className="pbtn" onClick={next}>Continue</button>
        </>
      )}
      {step === 2 && (
        <>
          <span className="badge imagined">imagined</span>
          {['Someone once did this for them.', 'Now it is your turn.', 'Who will you build?'].map((t, i) => (
            <p key={t} className="keeper line" style={{ animationDelay: `${i * 1.3}s` }}>{t}</p>
          ))}
          <button className="pbtn line" style={{ animationDelay: '4s' }} onClick={next}>Answer</button>
        </>
      )}
      {step === 3 && (
        <>
          <p className="keeper">I will build…</p>
          <div className="choices">
            {PRESETS.map((c) => (
              <button key={c} className="pbtn" onClick={() => { setWhat(c.toLowerCase()); setStep(4) }}>{c}</button>
            ))}
            <button className="pbtn" onClick={() => setTyping(true)}>My own idea</button>
          </div>
          {typing && (
            <>
              <label className="sr" htmlFor="idea">Your idea</label>
              <input id="idea" maxLength={24} value={custom} placeholder="a rover for the sea"
                onChange={(e) => setCustom(e.target.value)} />
              <button className="pbtn" onClick={() => { setWhat(custom.trim() || 'something new'); setStep(4) }}>
                Make my card
              </button>
            </>
          )}
        </>
      )}
      {step === 4 && (
        <>
          <canvas ref={cref} width={540} height={760} className="card" role="img"
            aria-label={`Keeper’s card: I will build ${what}`} />
          <div className="row">
            <button className="pbtn" onClick={save}>Save my card</button>
            <button className="pbtn" onClick={() => location.reload()}>Walk again</button>
          </div>
          <p className="fine">
            Facts come from NASA/JPL, NASA Science, NSSDCA and the NASA Image Library, credited in each memory.
            “Imagined” text is creative writing. Code, sound and draft text were made with SI assistance (Claude).
            Your card is made in your browser and is never uploaded.
          </p>
        </>
      )}
    </div>
  )
}