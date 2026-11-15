import { useDialog } from './useDialog'

export default function About({ onClose }) {
  const ref = useDialog(onClose)
  return (
    <div className="memory about" role="dialog" aria-modal="true" aria-label="About, sources and AI use" tabIndex={-1} ref={ref}>
      <button className="x" onClick={onClose} aria-label="Close">×</button>
      <h2>About NOEMA’26</h2>
      <p>A small pixel world about NASA machines left on Mars and the Moon, made for the NASA Space Apps Challenge 2026: “Abandoned but not Forgotten.”</p>
      <h3>How to read it</h3>
      <p><span className="badge documented">HISTORICAL RECORD</span> Facts with dates and sources.</p>
      <p><span className="badge imagined">IMAGINED TRANSMISSION</span> Creative writing. No spacecraft wrote these letters, and none is a NASA transmission.</p>
      <h3>Sources</h3>
      <p>NASA/JPL mission pages, NASA Science, the NASA Space Science Data Coordinated Archive (NSSDCA) and the NASA Image and Video Library. Photos load live from NASA and are credited under each image. Each machine’s Mission file lists its links. NASA does not endorse this project.</p>
      <p>Fonts: Press Start 2P and VT323 (open licence, Google Fonts).</p>
      <h3>AI use (SI)</h3>
      <p>SI assistance (Claude, by Anthropic) was used for the code, the generated music and sound effects, research summaries and draft text. The AI assistant checked facts against NASA/JPL/NSSDCA pages found through web search; the team has not independently verified every line. The team chose the creative direction and tested the experience on a phone. All artwork is drawn by code, and no AI image generators were used. Photos are real NASA photographs.</p>
      <p>The Keeper’s card is made in your browser. Your name and choice are never uploaded or stored.</p>
    </div>
  )
}