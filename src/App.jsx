import { useEffect, useState } from 'react'
import World from './World'
import Memory from './Memory'
import Ceremony from './Ceremony'
import Ending from './Ending'
import Intro from './Intro'
import About from './About'
import { machines } from './data/world'

import {
  startMusic,
  toggleMute,
  ignitionSound,
  setIntensity,
  fadeMusic,
  setVolume,
  setSfxVolume,
} from './music'

import './App.css'

export default function App() {
  const [started, setStarted] = useState(false)
  const [active, setActive] = useState(null)
  const [ceremony, setCeremony] = useState(null)
  const [lit, setLit] = useState([])
  const [done, setDone] = useState(false)
  const [muted, setMuted] = useState(false)
  const [about, setAbout] = useState(false)
  const [solved, setSolved] = useState([])

  // Independent volume settings, from 0 to 1.
  const [musicVol, setMusicVol] = useState(1)
  const [effectsVol, setEffectsVol] = useState(1)

  const all = lit.length >= machines.length

  useEffect(() => {
    setIntensity(lit.length)
  }, [lit])

  useEffect(() => {
    if (all) {
      fadeMusic(20)
    }
  }, [all])

  const begin = () => {
    startMusic()
    setStarted(true)
  }

  const handleMusicVolume = (value) => {
    const volume = Number(value)
    setMusicVol(volume)
    setVolume(volume)
  }

  const handleEffectsVolume = (value) => {
    const volume = Number(value)
    setEffectsVol(volume)
    setSfxVolume(volume)
  }

  const handleMute = () => {
    setMuted(toggleMute())
  }

  const release = (m) => {
    if (lit.includes(m.id)) {
      setActive(null)
      return
    }

    ignitionSound(m.sprite)
    setCeremony(m)
    setActive(null)
  }

  const finishCeremony = () => {
    setLit((l) =>
      l.includes(ceremony.id)
        ? l
        : [...l, ceremony.id]
    )

    setCeremony(null)
  }

  const busy =
    !started ||
    !!active ||
    !!ceremony ||
    done ||
    about

  return (
    <>
      <World
        lit={lit}
        paused={busy}
        onOpen={setActive}
        onFinish={() => setDone(true)}
      />

      {started && !busy && (
        <p className="hint">
          {all
            ? 'Every machine is lit. Follow the glow to the rocket.'
            : lit.length
              ? 'Walk to the next dark machine. Tap a lit one to read it again.'
              : 'Tap anywhere or use arrow keys / A and D to walk. Find the dark machines.'}
        </p>
      )}

      {/* Exploration progress */}
      <div
        className="progress"
        role="img"
        aria-label={`${lit.length} of ${machines.length} machines lit`}
      >
        {machines.map((m) => (
          <span
            key={m.id}
            className={
              lit.includes(m.id)
                ? 'dot on'
                : 'dot'
            }
          />
        ))}

        <span className="cnt">
          {lit.length}/{machines.length}
        </span>
      </div>

      {/* Audio and information controls */}
      <div className="controls">

        <div className="volume-controls">

          <label className="volume-control">
            <span className="volume-label">
              MUSIC
              <span className="volume-value">
                {Math.round(musicVol * 100)}%
              </span>
            </span>

            <input
              className="vol"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVol}
              onChange={(e) =>
                handleMusicVolume(e.target.value)
              }
              aria-label="Background music volume"
            />
          </label>

          <label className="volume-control">
            <span className="volume-label">
              EFFECTS
              <span className="volume-value">
                {Math.round(effectsVol * 100)}%
              </span>
            </span>

            <input
              className="vol"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={effectsVol}
              onChange={(e) =>
                handleEffectsVolume(e.target.value)
              }
              aria-label="Sound effects volume"
            />
          </label>

        </div>

        <button
          className="mute"
          onClick={handleMute}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          aria-pressed={muted}
        >
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>

        <button
          className="abt"
          onClick={() => setAbout(true)}
        >
          ABOUT
        </button>

      </div>

      {/* Opening sequence */}
      {!started && (
        <Intro onBegin={begin} />
      )}

      {/* Machine memory */}
      {active && (
        <Memory
          key={active.id}
          m={active}
          revisit={lit.includes(active.id)}
          onClose={() => setActive(null)}
          onDone={release}
          onSolve={(id, ok) => ok && setSolved((s) => (s.includes(id) ? s : [...s, id]))}
        />
      )}

      {/* Machine discovery ceremony */}
      {ceremony && (
        <Ceremony
          m={ceremony}
          onEnd={finishCeremony}
        />
      )}

      {/* About panel */}
      {about && (
        <About onClose={() => setAbout(false)} />
      )}

      {/* Final experience */}
      {done && (
        <Ending lit={lit} solved={solved.length} />
      )}
    </>
  )
}
