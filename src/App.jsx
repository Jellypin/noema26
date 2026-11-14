import { useEffect, useState } from 'react'
import World from './World'
import Memory from './Memory'
import Ceremony from './Ceremony'
import Ending from './Ending'
import Intro from './Intro'
import { machines } from './data/machines'
import { startMusic, toggleMute, ignitionSound, setIntensity } from './music'
import './App.css'

export default function App() {
  const [started, setStarted] = useState(false)
  const [active, setActive] = useState(null)
  const [ceremony, setCeremony] = useState(null)
  const [lit, setLit] = useState([])
  const [done, setDone] = useState(false)
  const [muted, setMuted] = useState(false)
  const all = lit.length >= machines.length

  useEffect(() => { setIntensity(lit.length) }, [lit])

  const begin = () => { startMusic(); setStarted(true) }
  const release = (m) => { ignitionSound(m.sprite); setCeremony(m); setActive(null) }
  const finishCeremony = () => {
    setLit((l) => (l.includes(ceremony.id) ? l : [...l, ceremony.id]))
    setCeremony(null)
  }

  return (
    <>
      <World
        lit={lit}
        paused={!started || !!active || !!ceremony || done}
        onOpen={setActive}
        onFinish={() => setDone(true)}
      />
      {started && !active && !ceremony && !done && (
        <p className="hint">
          {all ? 'Every machine is lit. Follow the glow to the rocket.' : 'Tap anywhere to walk. Find the dark machines.'}
        </p>
      )}
      <div className="progress" role="img" aria-label={`${lit.length} of ${machines.length} machines lit`}>
        {machines.map((m) => <span key={m.id} className={lit.includes(m.id) ? 'dot on' : 'dot'} />)}
      </div>
      <button className="mute" onClick={() => setMuted(toggleMute())}>
        {muted ? 'SOUND OFF' : 'SOUND ON'}
      </button>
      {!started && <Intro onBegin={begin} />}
      {active && <Memory key={active.id} m={active} onClose={() => setActive(null)} onDone={release} />}
      {ceremony && <Ceremony m={ceremony} onEnd={finishCeremony} />}
      {done && <Ending lit={lit} />}
    </>
  )
}