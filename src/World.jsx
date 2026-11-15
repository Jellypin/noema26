import { useEffect, useRef } from 'react'
import { machines } from './data/world'
import { launchSound } from './music'

const START = 180, GAP = 260
const mx = (i) => START + i * GAP
const mod = (a, n) => ((a % n) + n) % n
const rnd = (n) => mod(Math.sin(n * 12.9898) * 43758.5453, 1)
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
const SMALL = [
  '.....cc.....', '...pppppp...', '..bbbbbbbb..', '..bbbbbbbb..', '..bbbbbbbb..',
  '.ww..ww..ww.', '.ww..ww..ww.',
]
const INSIGHT = [
  '.......dddd.......', '......dddddd......', '.pppp..bbbb..pppp.', 'pppppp.bbbb.pppppp',
  '.pppp.bbbbbb.pppp.', '......bbbbbb......', '.....l.bbbb.l.....', '....l........l....',
  '...ll........ll...',
]
const TRIPOD = [
  '......aa......', '......aa......', '....cccccc....', '...bbbbbbbb...', '...bbbbbbbb...',
  '....bbbbbb....', '...l..bb..l...', '..l...bb...l..', '.ll........ll.', 'll..........ll',
]
const ROCKET = [
  '....n....', '...nnn...', '...nwn...', '..nwwwn..', '..nwcwn..', '..nwwwn..',
  '..nwwwn..', '..nwwwn..', '.fnwwwnf.', '.ffwwwff.', '.f.rrr.f.',
]
const ASTRO_A = ['..hhh..', '.hvvvh.', '.hvvvh.', '..hhh..', '.wwwww.', 'wwwwwww', '.wwwww.', '.ww.ww.', '.bb.bb.']
const ASTRO_B = ['..hhh..', '.hvvvh.', '.hvvvh.', '..hhh..', '.wwwww.', 'wwwwwww', '.wwwww.', 'ww...ww', 'b.....b']
const ASTRO = { h: '#dfe8ff', v: '#3b78d8', w: '#c8f7e8', b: '#7fe3c0' }
const ART = { rover: ROVER, rover2: ROVER, small: SMALL, insight: INSIGHT, tripod: TRIPOD }
const DIM = { a: '#5a6fb0', c: '#5a6fb0', d: '#5a6fb0', m: '#3b3b85', p: '#2a2a66', b: '#3b3b85', w: '#1a1a48', l: '#1a1a48' }
const LIT = { a: '#ffffff', c: '#ffffff', d: '#ffffff', m: '#c8f7e8', p: '#7fe3c0', b: '#c8f7e8', w: '#8fa8d8', l: '#8fa8d8' }
const ROCKET_DIM = { n: '#3b3b85', w: '#5a6fb0', c: '#1a1a48', f: '#2a2a66', r: '#1a1a48' }
const ROCKET_LIT = { n: '#7fe3c0', w: '#c8f7e8', c: '#3b78d8', f: '#ffd98a', r: '#8fa8d8' }

function sprite(g, rows, pal, x, y, o = {}) {
  const wd = rows[0].length
  rows.forEach((row, j) => {
    const sw = o.sway && j < 2 ? o.sway : 0
    for (let i = 0; i < wd; i++) {
      const ch = row[i]
      if (ch === '.') continue
      g.fillStyle = pal[ch]
      g.fillRect(x + (o.flip ? wd - 1 - i : i) + sw, y + j, 1, 1)
    }
  })
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
  const w = c.width, h = c.height, moon = st.moon, t = st.t, cam = Math.floor(st.cam)
  const allLit = lit.length >= machines.length
  const launching = st.launch >= 0
  const lift = launching ? Math.floor(st.launch * st.launch * 20) : 0
  const haze = 1 - moon, calm = st.reduced

  const SKY = SKY_MARS.map((col, i) => mix(col, SKY_MOON[i], moon))
  const n = SKY.length, band = Math.ceil((h * 0.8) / n) + 1
  SKY.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, Math.floor((h * 0.8 * i) / n), w, band) })
  g.fillStyle = SKY[n - 1]; g.fillRect(0, Math.floor(h * 0.8), w, h)
  for (let i = 1; i < n; i++) {
    g.fillStyle = SKY[i]
    const y = Math.floor((h * 0.8 * i) / n) - 1
    for (let x = i % 2; x < w; x += 2) g.fillRect(x, y, 1, 1)
  }
  for (let i = 0; i < 60; i++) {
    const x = mod((i * 53) % 400 - Math.floor(cam * 0.05), w)
    const y = (i * 37) % Math.max(1, Math.floor(h * 0.6))
    g.globalAlpha = i % 3 === 0 ? 1 : 0.6
    g.fillStyle = !calm && (Math.floor(t * 2) + i) % 5 === 0 ? '#ffffff' : '#c8f7e8'
    g.fillRect(x, y, 1, 1)
    if (i % 12 === 0) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3) }
  }
  g.globalAlpha = 1
  if (haze > 0.02) {
    g.globalAlpha = 0.16 * haze; g.fillStyle = '#c8553d'
    g.fillRect(0, Math.floor(h * 0.6), w, Math.floor(h * 0.14)); g.globalAlpha = 1
  }
  const sh = st.shoot
  if (sh) {
    for (let k = 0; k < 7; k++) {
      g.globalAlpha = 1 - k / 7; g.fillStyle = '#ffffff'
      g.fillRect(Math.floor(sh.x - sh.vx * k * 0.012), Math.floor(sh.y - sh.vy * k * 0.012), 1, 1)
    }
    g.globalAlpha = 1
  }
  if (!calm && !launching) {
    const sx = Math.floor(mod(t * 5, w + 30)) - 15, sy = Math.floor(h * 0.1)
    g.fillStyle = '#ffffff'
    if (Math.floor(t * 1.5) % 3 === 0) g.fillRect(sx, sy, 2, 1)
    else { g.globalAlpha = 0.5; g.fillRect(sx, sy, 1, 1); g.globalAlpha = 1 }
  }
  const pTop = mix('#8fa8d8', '#8fd8ff', moon), pMid = mix('#5a6fb0', '#3b78d8', moon), pLow = mix('#3b3b85', '#1f3f8f', moon)
  const pxp = mod(150 - Math.floor(cam * 0.05), w + 80) - 40
  circle(g, pxp, 40, Math.round(16 + 4 * moon), (j) => (j < -4 ? pTop : j < 4 ? pMid : pLow))
  circle(g, pxp - 30, 22, 4, () => pLow)

  const farC = mix('#2a2a6a', '#3a3a4a', moon), midC = mix('#1c1c52', '#2a2a38', moon), nearC = mix('#10103a', '#1a1a26', moon)
  g.save(); g.translate(0, Math.floor(lift * 0.4)); layer(g, w, h, cam * 0.3, h * 0.66, 6, 0.02, farC); g.restore()
  g.save(); g.translate(0, Math.floor(lift * 0.7)); layer(g, w, h, cam * 0.6, h * 0.72, 5, 0.03, midC); g.restore()

  g.save(); g.translate(0, lift)
  for (let x = 0; x < w; x++) {
    const y = gy(x + cam, h)
    g.fillStyle = nearC; g.fillRect(x, y, 1, h - y)
    g.globalAlpha = 0.5; g.fillStyle = '#7fe3c0'; g.fillRect(x, y, 1, 1); g.globalAlpha = 1
    const wx = x + cam
    if (mod(wx * 7, 5) === 0) { g.fillStyle = midC; g.fillRect(x, y + 3 + mod(wx, 7), 2, 1) }
  }
  const step = 17, first = Math.floor(cam / step) * step
  for (let wx = first; wx < cam + w + step; wx += step) {
    const r0 = rnd(wx), sx = wx - cam, y = gy(wx, h)
    if (r0 < 0.45) {
      const sz = 2 + Math.floor(rnd(wx + 1) * 3)
      g.fillStyle = midC; g.fillRect(sx, y - sz + 1, sz + 1, sz)
      g.globalAlpha = 0.35; g.fillStyle = '#7fe3c0'; g.fillRect(sx, y - sz + 1, sz + 1, 1); g.globalAlpha = 1
    } else if (moon > 0.3 && r0 > 0.8) {
      const half = 4 + Math.floor(rnd(wx + 2) * 5)
      g.globalAlpha = 0.4; g.fillStyle = '#000000'; g.fillRect(sx - half, y + 3, half * 2, 2)
      g.globalAlpha = 1; g.fillStyle = '#4a4a5a'; g.fillRect(sx - half, y + 2, half * 2, 1)
    }
  }

  machines.forEach((m, i) => {
    const sx = mx(i) - cam
    if (sx < -40 || sx > w + 40) return
    const rows = ART[m.art] || ROVER
    const on = lit.includes(m.id), y = gy(mx(i), h) - rows.length
    const half = Math.floor(rows[0].length / 2), d = Math.abs(st.x - mx(i))
    if (on) {
      g.globalAlpha = 0.12; circle(g, sx, y + 3, 24, () => '#7fe3c0')
      g.globalAlpha = 0.18; circle(g, sx, y + 3, 15, () => '#c8f7e8')
      g.globalAlpha = 1
    }
    let pal = on ? LIT : DIM
    if (m.art === 'rover2') pal = { ...pal, p: on ? '#ffd98a' : '#4a2a66' }
    sprite(g, rows, pal, sx - half, y, { sway: calm ? 0 : Math.round(Math.sin(t * 1.3 + i * 2)) })
    if (!on && d < 70 && !launching) {
      const r = 12 + (calm ? 0 : (Math.floor(t * 3) % 3) * 4)
      g.globalAlpha = 0.25 + 0.5 * (1 - d / 70); g.fillStyle = '#7fe3c0'
      for (let a = 0; a < 6.28; a += 0.3) {
        g.fillRect(Math.round(sx + Math.cos(a) * r), Math.round(y + rows.length / 2 + Math.sin(a) * r * 0.5), 1, 1)
      }
      g.globalAlpha = 1
    }
    if (!on && Math.floor(t * 2) % 2 === 0) { g.fillStyle = '#fff'; g.fillRect(sx, y - 9, 1, 3); g.fillRect(sx - 1, y - 8, 3, 1) }
  })

  if (!launching) {
    const ax = Math.floor(st.x - cam), moving = Math.abs(st.tx - st.x) > 2
    const fr = moving ? Math.floor(t * 8) % 2 : 0
    const ay = gy(st.x, h) - 9 - (moving && fr ? 1 : 0)
    sprite(g, fr ? ASTRO_B : ASTRO_A, ASTRO, ax - 3, ay, { flip: st.dir < 0 })
  }
  g.restore()

  if (!calm) {
    const nd = Math.floor(28 * haze)
    g.fillStyle = '#c8553d'
    for (let i = 0; i < nd; i++) {
      const x = mod(i * 61 + t * (4 + (i % 3) * 3) - cam * (0.4 + (i % 4) * 0.1), w)
      const y = Math.floor(h * 0.6 + rnd(i) * h * 0.2 + Math.sin(t * 0.5 + i) * 2)
      g.globalAlpha = 0.25 + (i % 3) * 0.1
      g.fillRect(Math.floor(x), y, 1, 1)
    }
    g.globalAlpha = 1
  }

  const rxw = mx(machines.length), rsx = rxw - cam
  const shake = launching && st.launch < 1.2 && !calm ? Math.round(Math.sin(t * 60)) : 0
  const ryTop = gy(rxw, h) - ROCKET.length
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

  
}

export default function World({ lit, paused, onOpen, onFinish }) {
  const ref = useRef(null)
  const s = useRef({
    x: 60, tx: 60, dir: 1, cam: 0, t: 0, k: 2, moon: 0, launch: -1, done: false,
    opened: {}, shoot: null, nextShoot: 6, reduced: false,
  })
  const keys = useRef({ left: false, right: false })
  const litRef = useRef(lit), pausedRef = useRef(paused), openRef = useRef(onOpen), finishRef = useRef(onFinish)
  litRef.current = lit; pausedRef.current = paused; openRef.current = onOpen; finishRef.current = onFinish

  useEffect(() => {
    const c = ref.current, g = c.getContext('2d'), st = s.current
    st.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rxw = mx(machines.length), maxX = rxw + 200
    const mi = machines.findIndex((m) => m.biome === 'moon')
    const resize = () => {
      const k = Math.max(3, Math.round(innerWidth / 150))
      st.k = k
      c.width = Math.ceil(innerWidth / k); c.height = Math.ceil(innerHeight / k)
    }
    const setKey = (e, v) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = v
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = v
    }
    const kd = (e) => setKey(e, true), ku = (e) => setKey(e, false)
    const blur = () => { keys.current.left = false; keys.current.right = false }
    resize()
    addEventListener('resize', resize); addEventListener('keydown', kd)
    addEventListener('keyup', ku); addEventListener('blur', blur)

    let raf, last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      st.t += dt
      if (!pausedRef.current) {
        if (keys.current.left) st.tx = st.x - 60
        if (keys.current.right) st.tx = st.x + 60
      }
      st.tx = Math.max(30, Math.min(maxX, st.tx))
      const f1 = 1 - Math.exp(-1.83 * dt), f2 = 1 - Math.exp(-3.08 * dt)
      const prev = st.x
      st.x += (st.tx - st.x) * f1
      if (Math.abs(st.x - prev) > 0.01) st.dir = st.x > prev ? 1 : -1
      st.cam += (st.x - c.width / 2 - st.cam) * f2
      const target = mi < 0 ? 0 : Math.max(0, Math.min(1, (st.x - (mx(mi) - 130)) / 100))
      st.moon += (target - st.moon) * f2

      if (!st.reduced) {
        if (!st.shoot && st.t > st.nextShoot) {
          st.shoot = { x: c.width * (0.4 + Math.random() * 0.6), y: Math.random() * c.height * 0.25, vx: -90, vy: 45, life: 0.9 }
          st.nextShoot = st.t + 9 + Math.random() * 14
        }
        if (st.shoot) {
          st.shoot.x += st.shoot.vx * dt; st.shoot.y += st.shoot.vy * dt; st.shoot.life -= dt
          if (st.shoot.life <= 0) st.shoot = null
        }
      }

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
        st.launch += dt
        if (st.launch > 5 && !st.done) { st.done = true; finishRef.current() }
      }
      draw(g, c, st, litRef.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize); removeEventListener('keydown', kd)
      removeEventListener('keyup', ku); removeEventListener('blur', blur)
    }
  }, [])

  const tap = (e) => {
    const st = s.current
    const wx = e.clientX / st.k + st.cam
    if (!pausedRef.current) {
      // Lit machines can be reread from anywhere. A dark machine can be
      // reopened by tapping it when the walker is next to it, so closing
      // a panel with x is never a dead end.
      const hit = machines.findIndex((m, i) =>
        Math.abs(wx - mx(i)) < 14 &&
        (litRef.current.includes(m.id) || Math.abs(st.x - mx(i)) < 56))
      if (hit >= 0) {
        st.opened[machines[hit].id] = true
        openRef.current(machines[hit])
        return
      }
    }
    st.tx = wx
  }
  return <canvas ref={ref} onPointerDown={tap} />
}
