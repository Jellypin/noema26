import { useEffect, useRef } from 'react'
import { machines } from './data/machines'
import { launchSound } from './music'

const START = 180, GAP = 260
const mx = (i) => START + i * GAP
const mod = (a, n) => ((a % n) + n) % n
const gy = (x, h) => Math.floor(h * 0.74 + Math.sin(x * 0.03) * 3 + Math.sin(x * 0.011) * 4)
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16))
const mix = (a, b, t) => {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')
}
const SKY_MARS = ['#07061a', '#0d0b2b', '#171447', '#241f63', '#34307f', '#4b4a9e']
const SKY_MOON = ['#020208', '#040410', '#070714', '#0a0a1a', '#0e0e22', '#13132c']

const ROVER = [
  '.......cc.......', '......cccc......', '.......mm.......', '.......mm.......',
  '..pppppppppppp..', '.bbbbbbbbbbbbbb.', '.bbbbbbbbbbbbbb.', '..bbbbbbbbbbbb..',
  '.ww...ww...ww...', '.ww...ww...ww...',
]
const LANDER = [
  '.......aa.......', '.......aa.......', '....cccccccc....', '.pppbbbbbbbbppp.',
  '.pppbbbbbbbbppp.', '....bbbbbbbb....', '...l..bbbb..l...', '..l..........l..',
  '.ll..........ll.',
]
const ROCKET = [
  '....n....', '...nnn...', '...nwn...', '..nwwwn..', '..nwcwn..', '..nwwwn..',
  '..nwwwn..', '..nwwwn..', '.fnwwwnf.', '.ffwwwff.', '.f.rrr.f.',
]
const DIM = { a: '#5a6fb0', c: '#5a6fb0', m: '#3b3b85', p: '#2a2a66', b: '#3b3b85', w: '#1a1a48', l: '#1a1a48' }
const LIT = { a: '#ffffff', c: '#ffffff', m: '#c8f7e8', p: '#7fe3c0', b: '#c8f7e8', w: '#8fa8d8', l: '#8fa8d8' }
const ROCKET_DIM = { n: '#3b3b85', w: '#5a6fb0', c: '#1a1a48', f: '#2a2a66', r: '#1a1a48' }
const ROCKET_LIT = { n: '#7fe3c0', w: '#c8f7e8', c: '#3b78d8', f: '#ffd98a', r: '#8fa8d8' }

function sprite(g, rows, pal, x, y) {
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== '.') { g.fillStyle = pal[ch]; g.fillRect(x + i, y + j, 1, 1) }
  }))
}
function circle(g, cx, cy, r, shade) {
  for (let j = -r; j <= r; j++) {
    const half = Math.floor(Math.sqrt(r * r - j * j))
    g.fillStyle = shade(j); g.fillRect(cx - half, cy + j, half * 2 + 1, 1)
  }
}
function layer(g, w, h, off, base, amp, f, col) {
  g.fillStyle = col
  for (let x = 0; x < w; x++) {
    const y = Math.floor(base + Math.sin((x + off) * f) * amp + Math.sin((x + off) * f * 2.3) * amp * 0.4)
    g.fillRect(x, y, 1, h - y)
  }
}

function draw(g, c, st, lit) {
  const w = c.width, h = c.height, moon = st.moon, allLit = lit.length >= machines.length
  const SKY = SKY_MARS.map((col, i) => mix(col, SKY_MOON[i], moon))
  const n = SKY.length, band = Math.ceil((h * 0.8) / n) + 1
  SKY.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, Math.floor((h * 0.8 * i) / n), w, band) })
  g.fillStyle = SKY[n - 1]; g.fillRect(0, Math.floor(h * 0.8), w, h)
  for (let i = 1; i < n; i++) {
    g.fillStyle = SKY[i]
    const y = Math.floor((h * 0.8 * i) / n) - 1
    for (let x = i % 2; x < w; x += 2) g.fillRect(x, y, 1, 1)
  }
  const cam = Math.floor(st.cam)
  for (let i = 0; i < 60; i++) {
    const x = mod((i * 53) % 400 - Math.floor(cam * 0.05), w)
    const y = (i * 37) % Math.max(1, Math.floor(h * 0.6))
    g.globalAlpha = i % 3 === 0 ? 1 : 0.6
    g.fillStyle = (Math.floor(st.t * 2) + i) % 5 === 0 ? '#ffffff' : '#c8f7e8'
    g.fillRect(x, y, 1, 1)
    if (i % 12 === 0) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3) }
  }
  g.globalAlpha = 1
  const pTop = mix('#8fa8d8', '#8fd8ff', moon), pMid = mix('#5a6fb0', '#3b78d8', moon), pLow = mix('#3b3b85', '#1f3f8f', moon)
  const pxp = mod(150 - Math.floor(cam * 0.05), w + 80) - 40
  circle(g, pxp, 40, Math.round(16 + 4 * moon), (j) => (j < -4 ? pTop : j < 4 ? pMid : pLow))
  circle(g, pxp - 30, 22, 4, () => pLow)

  const far = mix('#2a2a6a', '#3a3a4a', moon), mid = mix('#1c1c52', '#2a2a38', moon), near = mix('#10103a', '#1a1a26', moon)
  layer(g, w, h, cam * 0.3, h * 0.66, 6, 0.02, far)
  layer(g, w, h, cam * 0.6, h * 0.72, 5, 0.03, mid)
  for (let x = 0; x < w; x++) {
    const y = gy(x + cam, h)
    g.fillStyle = near; g.fillRect(x, y, 1, h - y)
    g.globalAlpha = 0.5; g.fillStyle = '#7fe3c0'; g.fillRect(x, y, 1, 1); g.globalAlpha = 1
    const wx = x + cam
    if (mod(wx * 7, 5) === 0) { g.fillStyle = mid; g.fillRect(x, y + 3 + mod(wx, 7), 2, 1) }
  }

  machines.forEach((m, i) => {
    const sx = mx(i) - cam
    if (sx < -40 || sx > w + 40) return
    const rows = m.sprite === 'lander' ? LANDER : ROVER
    const y = gy(mx(i), h) - rows.length, on = lit.includes(m.id)
    if (on) {
      g.globalAlpha = 0.12; circle(g, sx, y + 3, 24, () => '#7fe3c0')
      g.globalAlpha = 0.18; circle(g, sx, y + 3, 15, () => '#c8f7e8')
      g.globalAlpha = 1
    }
    sprite(g, rows, on ? LIT : DIM, sx - 8, y)
    if (!on && Math.floor(st.t * 2) % 2 === 0) {
      g.fillStyle = '#fff'; g.fillRect(sx, y - 9, 1, 3); g.fillRect(sx - 1, y - 8, 3, 1)
    }
  })

  const rxw = mx(machines.length), rsx = rxw - cam
  const e = st.launch, launching = e >= 0
  const lift = launching ? Math.floor(e * e * 20) : 0
  const shake = launching && e < 1.2 ? Math.round(Math.sin(st.t * 60)) : 0
  const ryTop = gy(rxw, h) - ROCKET.length - lift
  if (rsx > -40 && rsx < w + 40) {
    if (allLit) { g.globalAlpha = 0.12; circle(g, rsx + shake, ryTop + 5, 22, () => '#ffd98a'); g.globalAlpha = 1 }
    sprite(g, ROCKET, allLit ? ROCKET_LIT : ROCKET_DIM, rsx - 4 + shake, ryTop)
    if (launching) {
      for (let k = 0; k < 8; k++) {
        g.fillStyle = k % 2 ? '#ffd98a' : '#ff9a5a'
        const wide = k % 3 === 0
        g.fillRect(rsx - 1 + shake - (wide ? 1 : 0), ryTop + ROCKET.length + k, wide ? 5 : 3, 1)
      }
    }
  }

  let px = Math.floor(st.x - cam), py = gy(st.x, h) - 12 + Math.round(Math.sin(st.t * 3) * 1.5)
  if (launching) { px = Math.floor(rsx) + shake; py = ryTop + 4 }
  g.globalAlpha = 0.15; circle(g, px, py, 9, () => '#7fe3c0')
  g.globalAlpha = 0.3; circle(g, px, py, 5, () => '#c8f7e8')
  g.globalAlpha = 1; g.fillStyle = '#fff'
  g.fillRect(px - 1, py, 3, 1); g.fillRect(px, py - 1, 1, 3)
}

export default function World({ lit, paused, onOpen, onFinish }) {
  const ref = useRef(null)
  const s = useRef({ x: 60, tx: 60, cam: 0, t: 0, k: 2, moon: 0, launch: -1, done: false, opened: {} })
  const litRef = useRef(lit), pausedRef = useRef(paused), openRef = useRef(onOpen), finishRef = useRef(onFinish)
  litRef.current = lit; pausedRef.current = paused; openRef.current = onOpen; finishRef.current = onFinish

  useEffect(() => {
    const c = ref.current, g = c.getContext('2d')
    const rxw = mx(machines.length), maxX = rxw + 200
    const mi = machines.findIndex((m) => m.biome === 'moon')
    const resize = () => {
      const k = Math.max(3, Math.round(innerWidth / 150))
      s.current.k = k
      c.width = Math.ceil(innerWidth / k); c.height = Math.ceil(innerHeight / k)
    }
    const key = (e) => {
      if (e.key === 'ArrowRight') s.current.tx += 50
      if (e.key === 'ArrowLeft') s.current.tx -= 50
    }
    resize(); addEventListener('resize', resize); addEventListener('keydown', key)
    let raf
    const loop = () => {
      const st = s.current
      st.t += 0.016
      st.tx = Math.max(30, Math.min(maxX, st.tx))
      st.x += (st.tx - st.x) * 0.03
      st.cam += (st.x - c.width / 2 - st.cam) * 0.05
      const target = mi < 0 ? 0 : Math.max(0, Math.min(1, (st.x - (mx(mi) - 130)) / 100))
      st.moon += (target - st.moon) * 0.05
      machines.forEach((m, i) => {
        const d = Math.abs(st.x - mx(i))
        if (d > 56) st.opened[m.id] = false
        else if (d < 24 && !st.opened[m.id] && !pausedRef.current && !litRef.current.includes(m.id)) {
          st.opened[m.id] = true
          openRef.current(m)
        }
      })
      if (st.launch < 0 && litRef.current.length >= machines.length && !pausedRef.current && Math.abs(st.x - rxw) < 24) {
        st.launch = 0; launchSound()
      }
      if (st.launch >= 0) {
        st.launch += 0.016
        if (st.launch > 5 && !st.done) { st.done = true; finishRef.current() }
      }
      draw(g, c, st, litRef.current)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('keydown', key) }
  }, [])

  const tap = (e) => { s.current.tx = e.clientX / s.current.k + s.current.cam }
  return <canvas ref={ref} onPointerDown={tap} />
}
