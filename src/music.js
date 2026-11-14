// Ambient music generated in code with SI assistance (Claude). No audio files are used.
let ctx = null, master = null, started = false, muted = false
const NOTES = [0, 3, 7, 10, 12, 7, 3, 5]

export function startMusic() {
  if (started) return
  started = true
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    if (ctx.state === 'suspended') ctx.resume()
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.05; master.connect(ctx.destination)
    ;[110, 164.81, 220].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      const l = ctx.createOscillator(), lg = ctx.createGain()
      o.type = 'sine'; o.frequency.value = f; o.detune.value = i * 4
      g.gain.value = 0.3
      l.frequency.value = 0.05 + i * 0.03; lg.gain.value = 0.15
      l.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(master)
      o.start(); l.start()
    })
    let step = 0
    const pluck = () => {
      const f = 220 * Math.pow(2, NOTES[step % NOTES.length] / 12), t = ctx.currentTime
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'square'; o.frequency.value = f
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.7)
      step++
    }
    pluck(); setInterval(pluck, 2400)
  } catch (e) { /* audio is optional */ }
}

export function toggleMute() {
  muted = !muted
  if (master) master.gain.value = muted ? 0 : 0.05
  return muted
}

export function launchSound() {
  if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(500, t + 4)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.5, t + 1); g.gain.exponentialRampToValueAtTime(0.0001, t + 5)
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 5)
}
