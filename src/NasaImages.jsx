import { useEffect, useState } from 'react'

export default function NasaImages({ query, limit = 1 }) {
  const [items, setItems] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then((j) => {
        if (cancelled) return
        const list = (j.collection?.items ?? [])
          .filter((i) => i.links?.[0]?.href && i.data?.[0])
          .slice(0, limit)
        setItems(list)
      })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [query, limit])

  if (failed) return <p className="src">NASA images could not be loaded right now.</p>
  if (!items) return <p className="src">Loading NASA images…</p>
  return (
    <div className="gallery">
      {items.map((i) => (
        <figure key={i.data[0].nasa_id}>
          <img src={i.links[0].href} alt={i.data[0].title} loading="lazy" />
          <figcaption>
            {i.data[0].title} ·{' '}
            <a href={`https://images.nasa.gov/details/${i.data[0].nasa_id}`}
               target="_blank" rel="noreferrer">NASA Image Library</a>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
