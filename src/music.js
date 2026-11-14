// Audio generated in code with SI assistance (Claude). Original composition: a generic chord loop,
// arpeggios and swells built from oscillators. No samples, no audio files, no melodies from any film or song.
let ctx = null, master = null, sfx = null, bus = null
let started = false, muted = false, finale = false, level = 0, step = 0, chordIdx = 0
let padVoices = [], choirVoices = []
let padGain = null, padFilter = null, arpGain = null, pulseGain = null, choirGain = null, leadGain = null

const MUSIC_VOL = 0.09   // overall music loudness
const SFX_VOL = 0.3      // ignition and launch sounds
const TICK_MS = 450      // tempo: lower = faster
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)

const CHORDS = [
  { root: 50, third: 3, lead: [74, 69, 77] },  // D minor
  { root: 46, third: 4, lead: [74, 70, 77] },  // B-flat major
  { root: 53, third: 4, lead: [69, 72, 77] },  // F major
  { root: 48, third: 4, lead: [67, 76, 72] },  // C major
]
const FINALE = { root: 50, third: 4, lead: [74, 78, 81] }  // D major

function setChord(ch, glide = 1.2) {
  if (!ctx) return
  const t = ctx.currentTime
  const pad = [ch.root - 12, ch.root, ch.root + ch.third, ch.root + 7]
  padVoices.forEach((o, i) => o.frequency.setTargetAtTime(mtof(pad[i]), t, glide))
  const hi = [ch.root + 12, ch.root + 12 + ch.third, ch.root + 19]
  choirVoices.forEach((o, i) => o.frequency.setTargetAtTime(mtof(hi[i]), t, glide))
}

function note(midi, dur, vol, type, dest, attack = 0.02) {
  const t = ctx.currentTime
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = mtof(midi)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05)
}

function applyLevel(n) {
  if (!ctx) return
  const t = ctx.currentTime
  const to = (g, v) => g.gain.setTargetAtTime(v, t, 1.5)
  to(padGain, n >= 1 ? 0.2 : 0.12)
  to(arpGain, n >= 1 ? 0.9 : 0)
  to(pulseGain, n >= 2 ? 1 : 0)
  to(choirGain, n >= 3 ? 0.12 : 0)
  to(leadGain, n >= 4 ? 0.9 : 0)
  padFilter.frequency.setTargetAtTime(n >= 5 ? 2200 : 900, t, 2)
}

export function setIntensity(n) { level = n; applyLevel(n) }

function tick() {
  if (!ctx || ctx.state !== 'running') return
  if (!finale && step > 0 && step % 16 === 0) {
    chordIdx = (chordIdx + 1) % CHORDS.length
    setChord(CHORDS[chordIdx])
  }
  const ch = finale ? FINALE : CHORDS[chordIdx]
  const k = step % 16
  const tones = [0, ch.third, 7, 12, 12 + ch.third, 19]
  const pat = [0, 1, 2, 3, 4, 3, 2, 1]
  if (level >= 1) note(ch.root + 12 + tones[pat[step % 8]], 1.4, 0.4, 'triangle', arpGain)
  if (level >= 2 && step % 2 === 0) note(ch.root - 12, 0.9, 0.8, 'sine', pulseGain)
  if (level >= 4 && k % 4 === 0 && k < 12) note(ch.lead[k / 4], 3.2, 0.45, 'triangle', leadGain, 0.25)
  step++
}

export function startMusic() {
  if (started) return
  started = true
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    if (ctx.state === 'suspended') ctx.resume()
    master = ctx.createGain(); master.gain.value = muted ? 0 : MUSIC_VOL; master.connect(ctx.destination)
    sfx = ctx.createGain(); sfx.gain.value = muted ? 0 : SFX_VOL; sfx.connect(ctx.destination)

    bus = ctx.createGain(); bus.connect(master)
    const delay = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain()
    delay.delayTime.value = 0.42; fb.gain.value = 0.4; wet.gain.value = 0.35
    bus.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master)

    const nlen = ctx.sampleRate * 2
    const nbuf = ctx.createBuffer(1, nlen, ctx.sampleRate), nd = nbuf.getChannelData(0)
    for (let i = 0; i < nlen; i++) nd[i] = Math.random() * 2 - 1
    const wind = ctx.createBufferSource(), wf = ctx.createBiquadFilter(), wg = ctx.createGain()
    const wl = ctx.createOscillator(), wlg = ctx.createGain()
    wind.buffer = nbuf; wind.loop = true; wf.type = 'lowpass'; wf.frequency.value = 500
    wg.gain.value = 0.25; wl.frequency.value = 0.07; wlg.gain.value = 0.15
    wl.connect(wlg); wlg.connect(wg.gain); wind.connect(wf); wf.connect(wg); wg.connect(master)
    wind.start(); wl.start()

    padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 900
    padGain = ctx.createGain(); padGain.gain.value = 0.12
    padFilter.connect(padGain); padGain.connect(bus)
    padVoices = [0, -6, 5, 3].map((d) => {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.detune.value = d
      o.frequency.value = 110; o.connect(padFilter); o.start(); return o
    })

    choirGain = ctx.createGain(); choirGain.gain.value = 0; choirGain.connect(bus)
    choirVoices = [0, 4, -4].map((d) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.detune.value = d
      o.frequency.value = 220; o.connect(choirGain); o.start(); return o
    })

    arpGain = ctx.createGain(); arpGain.gain.value = 0; arpGain.connect(bus)
    pulseGain = ctx.createGain(); pulseGain.gain.value = 0; pulseGain.connect(bus)
    leadGain = ctx.createGain(); leadGain.gain.value = 0; leadGain.connect(bus)

    setChord(CHORDS[0], 0.05)
    applyLevel(level)
    setInterval(tick, TICK_MS)
  } catch (e) { /* audio is optional */ }
}

export function finaleSwell() {
  if (!ctx || !master || finale) return
  finale = true
  const t = ctx.currentTime
  setChord(FINALE, 2.5)
  applyLevel(5)
  ;[74, 78, 81, 86].forEach((m, i) => setTimeout(() => note(m, 4, 0.5, 'triangle', leadGain, 0.3), i * 1100))
  if (!muted) {
    master.gain.cancelScheduledValues(t)
    master.gain.setValueAtTime(master.gain.value, t)
    master.gain.linearRampToValueAtTime(MUSIC_VOL * 2.4, t + 4.5)
    master.gain.linearRampToValueAtTime(MUSIC_VOL * 2.4, t + 7.5)
    master.gain.linearRampToValueAtTime(0.0001, t + 14)
  }
}

export function toggleMute() {
  muted = !muted
  if (master) master.gain.value = muted || finale ? 0 : MUSIC_VOL
  if (sfx) sfx.gain.value = muted ? 0 : SFX_VOL
  return muted
}

export function ignitionSound(kind) {
  if (!ctx || !sfx) return
  const t = ctx.currentTime
  if (kind === 'lander') {
    const len = Math.floor(ctx.sampleRate * 0.9)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), ng = ctx.createGain()
    src.buffer = buf; f.type = 'bandpass'
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2500, t + 0.9)
    ng.gain.setValueAtTime(0.0001, t)
    ng.gain.exponentialRampToValueAtTime(0.3, t + 0.2); ng.gain.exponentialRampToValueAtTime(0.0001, t + 1)
    src.connect(f); f.connect(ng); ng.connect(sfx); src.start(t)
  } else {
    const o = ctx.createOscillator(), g = ctx.createGain()
    const lfo = ctx.createOscillator(), lg = ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.9)
    lfo.frequency.setValueAtTime(8, t); lfo.frequency.linearRampToValueAtTime(30, t + 0.9)
    lg.gain.value = 0.08
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
    lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(sfx)
    o.start(t); lfo.start(t); o.stop(t + 1.2); lfo.stop(t + 1.2)
  }
}

export function launchSound() {
  finaleSwell()
  if (!ctx || !sfx) return
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(500, t + 4)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.3, t + 1); g.gain.exponentialRampToValueAtTime(0.0001, t + 5)
  o.connect(g); g.connect(sfx); o.start(t); o.stop(t + 5)
}