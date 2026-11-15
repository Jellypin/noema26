
 // Procedural original audio composition.
 // Generated using oscillators and synthesized noise. No external samples.

let ctx = null
let master = null
let sfx = null
let bus = null

let started = false
let muted = false
let faded = false
let fadeEnd = 0
let level = 0
let step = 0
let chordIdx = 0

let musicVolume = 1
let effectsVolume = 1

let padVoices = []
let choirVoices = []

let padGain = null
let padFilter = null
let arpGain = null
let pulseGain = null
let choirGain = null
let leadGain = null

// Increased default loudness.
const MUSIC_VOL = 0.22
const SFX_VOL = 0.3
const TICK_MS = 450

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)

const CHORDS = [
  { root: 50, third: 3, lead: [74, 69, 77] },
  { root: 46, third: 4, lead: [74, 70, 77] },
  { root: 53, third: 4, lead: [69, 72, 77] },
  { root: 48, third: 4, lead: [67, 76, 72] },
]

function setChord(ch, glide = 1.2) {
  if (!ctx) return

  const t = ctx.currentTime

  const pad = [
    ch.root - 12,
    ch.root,
    ch.root + ch.third,
    ch.root + 7,
  ]

  padVoices.forEach((o, i) => {
    o.frequency.setTargetAtTime(mtof(pad[i]), t, glide)
  })

  const hi = [
    ch.root + 12,
    ch.root + 12 + ch.third,
    ch.root + 19,
  ]

  choirVoices.forEach((o, i) => {
    o.frequency.setTargetAtTime(mtof(hi[i]), t, glide)
  })
}

function note(midi, dur, vol, type, dest, attack = 0.02) {
  if (!ctx || !dest) return

  const t = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()

  o.type = type
  o.frequency.value = mtof(midi)

  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)

  o.connect(g)
  g.connect(dest)

  o.start(t)
  o.stop(t + dur + 0.05)
}

function applyLevel(n) {
  if (!ctx || !padGain) return

  const t = ctx.currentTime
  const to = (g, v) => {
    if (g) g.gain.setTargetAtTime(v, t, 1.5)
  }

  to(padGain, n >= 1 ? 0.2 : 0.12)
  to(arpGain, n >= 1 ? 0.9 : 0)
  to(pulseGain, n >= 2 ? 1 : 0)
  to(choirGain, n >= 3 ? 0.12 : 0)
  to(leadGain, n >= 4 ? 0.9 : 0)

  if (padFilter) {
    padFilter.frequency.setTargetAtTime(
      n >= 5 ? 2200 : 900,
      t,
      2
    )
  }
}

export function setIntensity(n) {
  level = n
  applyLevel(n)
}

// Background music volume: 0 to 1.
export function setVolume(value) {
  const v = Number(value)
  if (!Number.isFinite(v)) return

  musicVolume = Math.max(0, Math.min(1, v))

  if (master && ctx && !muted && !faded) {
    const t = ctx.currentTime
    master.gain.cancelScheduledValues(t)
    master.gain.setTargetAtTime(
      MUSIC_VOL * musicVolume,
      t,
      0.05
    )
  }
}

// Sound effects volume: 0 to 1.
export function setSfxVolume(value) {
  const v = Number(value)
  if (!Number.isFinite(v)) return

  effectsVolume = Math.max(0, Math.min(1, v))

  if (sfx && ctx && !muted) {
    const t = ctx.currentTime
    sfx.gain.cancelScheduledValues(t)
    sfx.gain.setTargetAtTime(
      SFX_VOL * effectsVolume,
      t,
      0.05
    )
  }
}

function tick() {
  if (!ctx || ctx.state !== 'running') return
  if (faded && ctx.currentTime > fadeEnd + 0.5) return

  if (step > 0 && step % 16 === 0) {
    chordIdx = (chordIdx + 1) % CHORDS.length
    setChord(CHORDS[chordIdx])
  }

  const ch = CHORDS[chordIdx]
  const k = step % 16

  const tones = [
    0,
    ch.third,
    7,
    12,
    12 + ch.third,
    19,
  ]

  const pat = [0, 1, 2, 3, 4, 3, 2, 1]

  if (level >= 1) {
    note(
      ch.root + 12 + tones[pat[step % 8]],
      1.4,
      0.4,
      'triangle',
      arpGain
    )
  }

  if (level >= 2 && step % 2 === 0) {
    note(ch.root - 12, 0.9, 0.8, 'sine', pulseGain)
  }

  if (level >= 4 && k % 4 === 0 && k < 12) {
    note(
      ch.lead[k / 4],
      3.2,
      0.45,
      'triangle',
      leadGain,
      0.25
    )
  }

  step++
}

export function startMusic() {
  if (started) return

  started = true

  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return

    ctx = new AC()

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    // Music master channel
    master = ctx.createGain()
    master.gain.value = muted ? 0 : MUSIC_VOL * musicVolume
    master.connect(ctx.destination)

    // Independent sound effects channel
    sfx = ctx.createGain()
    sfx.gain.value = muted ? 0 : SFX_VOL * effectsVolume
    sfx.connect(ctx.destination)

    // Music bus and echo
    bus = ctx.createGain()
    bus.connect(master)

    const delay = ctx.createDelay(1)
    const fb = ctx.createGain()
    const wet = ctx.createGain()

    delay.delayTime.value = 0.42
    fb.gain.value = 0.4
    wet.gain.value = 0.35

    bus.connect(delay)
    delay.connect(fb)
    fb.connect(delay)
    delay.connect(wet)
    wet.connect(master)

    // Ambient wind
    const nlen = ctx.sampleRate * 2
    const nbuf = ctx.createBuffer(1, nlen, ctx.sampleRate)
    const nd = nbuf.getChannelData(0)

    for (let i = 0; i < nlen; i++) {
      nd[i] = Math.random() * 2 - 1
    }

    const wind = ctx.createBufferSource()
    const wf = ctx.createBiquadFilter()
    const wg = ctx.createGain()

    const wl = ctx.createOscillator()
    const wlg = ctx.createGain()

    wind.buffer = nbuf
    wind.loop = true

    wf.type = 'lowpass'
    wf.frequency.value = 500

    wg.gain.value = 0.25
    wl.frequency.value = 0.07
    wlg.gain.value = 0.15

    wl.connect(wlg)
    wlg.connect(wg.gain)

    wind.connect(wf)
    wf.connect(wg)
    wg.connect(master)

    wind.start()
    wl.start()

    // Atmospheric pad
    padFilter = ctx.createBiquadFilter()
    padFilter.type = 'lowpass'
    padFilter.frequency.value = 900

    padGain = ctx.createGain()
    padGain.gain.value = 0.12

    padFilter.connect(padGain)
    padGain.connect(bus)

    padVoices = [0, -6, 5, 3].map((d) => {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.detune.value = d
      o.frequency.value = 110
      o.connect(padFilter)
      o.start()
      return o
    })

    // Choir
    choirGain = ctx.createGain()
    choirGain.gain.value = 0
    choirGain.connect(bus)

    choirVoices = [0, 4, -4].map((d) => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.detune.value = d
      o.frequency.value = 220
      o.connect(choirGain)
      o.start()
      return o
    })

    // Arpeggio
    arpGain = ctx.createGain()
    arpGain.gain.value = 0
    arpGain.connect(bus)

    // Pulse
    pulseGain = ctx.createGain()
    pulseGain.gain.value = 0
    pulseGain.connect(bus)

    // Lead
    leadGain = ctx.createGain()
    leadGain.gain.value = 0
    leadGain.connect(bus)

    setChord(CHORDS[0], 0.05)
    applyLevel(level)

    setInterval(tick, TICK_MS)

  } catch (e) {
    console.error('Audio initialization failed:', e)
  }
}

export function fadeMusic(sec) {
  if (!ctx || !master) return

  const t = ctx.currentTime

  master.gain.cancelScheduledValues(t)
  master.gain.setValueAtTime(master.gain.value, t)
  master.gain.linearRampToValueAtTime(0.0001, t + sec)

  faded = true
  fadeEnd = t + sec
}

export function toggleMute() {
  muted = !muted

  if (master && ctx && !faded) {
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(
      muted ? 0 : MUSIC_VOL * musicVolume,
      ctx.currentTime,
      0.05
    )
  }

  if (sfx && ctx) {
    sfx.gain.cancelScheduledValues(ctx.currentTime)
    sfx.gain.setTargetAtTime(
      muted ? 0 : SFX_VOL * effectsVolume,
      ctx.currentTime,
      0.05
    )
  }

  return muted
}

export function ignitionSound(kind) {
  if (!ctx || !sfx || muted) return

  const t = ctx.currentTime

  if (kind === 'lander') {
    const len = Math.floor(ctx.sampleRate * 0.9)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)

    for (let i = 0; i < len; i++) {
      d[i] = Math.random() * 2 - 1
    }

    const src = ctx.createBufferSource()
    const f = ctx.createBiquadFilter()
    const ng = ctx.createGain()

    src.buffer = buf
    f.type = 'bandpass'

    f.frequency.setValueAtTime(400, t)
    f.frequency.exponentialRampToValueAtTime(2500, t + 0.9)

    ng.gain.setValueAtTime(0.0001, t)
    ng.gain.exponentialRampToValueAtTime(0.3, t + 0.2)
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 1)

    src.connect(f)
    f.connect(ng)
    ng.connect(sfx)

    src.start(t)

  } else {
    const o = ctx.createOscillator()
    const g = ctx.createGain()

    const lfo = ctx.createOscillator()
    const lg = ctx.createGain()

    o.type = 'sawtooth'

    o.frequency.setValueAtTime(70, t)
    o.frequency.exponentialRampToValueAtTime(260, t + 0.9)

    lfo.frequency.setValueAtTime(8, t)
    lfo.frequency.linearRampToValueAtTime(30, t + 0.9)

    lg.gain.value = 0.08

    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.15)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)

    lfo.connect(lg)
    lg.connect(g.gain)

    o.connect(g)
    g.connect(sfx)

    o.start(t)
    lfo.start(t)
    o.stop(t + 1.2)
    lfo.stop(t + 1.2)
  }
}

export function launchSound() {
  fadeMusic(3)

  if (!ctx || !sfx || muted) return

  const o = ctx.createOscillator()
  const g = ctx.createGain()
  const t = ctx.currentTime

  o.type = 'sawtooth'

  o.frequency.setValueAtTime(60, t)
  o.frequency.exponentialRampToValueAtTime(500, t + 4)

  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.3, t + 1)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 5)

  o.connect(g)
  g.connect(sfx)

  o.start(t)
  o.stop(t + 5)
}
