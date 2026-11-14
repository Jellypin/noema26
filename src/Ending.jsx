export default function Ending({ count }) {
  return (
    <div className="ending">
      <h1>Thank you for playing</h1>
      <p>NOEMA’26 · NASA Space Apps Challenge 2026</p>
      <p>Abandoned but not Forgotten: {count} machines, left behind, remembered.</p>
      <p className="fine">
        Facts come from NASA/JPL, NASA Science and NSSDCA pages, credited in each memory.
        “Imagined” voices are creative writing. Code, music and draft text were made with SI assistance (Claude).
      </p>
      <button onClick={() => location.reload()}>Walk again</button>
    </div>
  )
}