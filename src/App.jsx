import { useEffect, useState } from 'react'
import World from './World'
import Memory from './Memory'
import Ending from './Ending'
import { machines } from './data/machines'
import { startMusic, toggleMute, ignitionSound } from './music'
import './App.css'

export default function App() {
  const [active, setActive] = useState(null)
  const [lit, setLit] = useState([])
  const [done, setDone] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const go = () => {
      startMusic()
      removeEventListener('pointerdown', go); removeEventListener('keydown', go)
    }
    addEventListener('pointerdown', go); addEventListener('keydown', go)
    return () => { removeEventListener('pointerdown', go); removeEventListener('keydown', go) }
  }, [])

  const all = lit.length >= machines.length
  return (
    <>
      <World lit={lit} paused={!!active || done} onOpen={setActive} onFinish={() => setDone(true)} />
      <p className="hint">
        {all ? 'Every machine is lit. A rocket waits ahead.' : 'Tap anywhere to walk. Find the dark machines.'}
      </p>
      <button className="mute" onClick={() => setMuted(toggleMute())}>
        {muted ? 'SOUND OFF' : 'SOUND ON'}
      </button>
      {active && (
        <Memory
          key={active.id}
          m={active}
          onClose={() => setActive(null)}
          onDone={() => { ignitionSound(active.sprite); setLit((l) => [...l, active.id]); setActive(null) }}
        />
      )}
      {done && <Ending count={machines.length} />}
    </>
  )
}
