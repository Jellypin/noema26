import { machines } from './data/machines'
import NasaImages from './NasaImages'
import './App.css'

export default function App() {
  return (
    <main>
      <header className="hero">
        <h1>NOEMA</h1>
        <p>Machines we left behind. Stories we should not forget.</p>
      </header>
      {machines.map((m) => (
        <section key={m.id} className="machine">
          <h2>{m.name}</h2>
          <p className="tag">{m.tagline}</p>
          <NasaImages query={m.imageQuery} />
          {m.chapters.map((c) => (
            <article key={c.title} className="chapter">
              <span className={`badge ${c.kind}`}>{c.kind}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <small className="src">Source: {c.source}</small>
            </article>
          ))}
        </section>
      ))}
    </main>
  )
}