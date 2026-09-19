import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Search } from 'lucide-react'
import { Link } from 'react-router'
import type { WorldSummary } from '../domain'
import { formatDate, statusLabel } from '../domain'
import { gateway } from '../lib/contract'

export default function Worlds() {
  const [worlds, setWorlds] = useState<WorldSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const reload = () => {
    setLoading(true)
    setError(null)
    void gateway.listWorlds().then(setWorlds).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Worlds could not be loaded.')).finally(() => setLoading(false))
  }
  useEffect(reload, [])
  const filtered = useMemo(() => worlds.filter((world) => world.title.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || (filter === 'active' ? ['OPEN', 'READY', 'REVIEWING', 'RETRYABLE'].includes(world.status) : ['MERGED', 'FORKED', 'CLOSED'].includes(world.status)))), [worlds, query, filter])
  return <div className="container page-wrap"><div className="page-intro"><span className="eyebrow">THE LIBRARY</span><h1 tabIndex={-1}>Explore living worlds.</h1><p>Read the canon, follow two voices, and return to see where each story went.</p></div><div className="library-controls"><label className="search-field"><Search size={18} aria-hidden="true" /><span className="sr-only">Search worlds by title</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by world title" /></label><div className="segmented" role="group" aria-label="Filter worlds"><button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button><button type="button" aria-pressed={filter === 'active'} onClick={() => setFilter('active')}>In progress</button><button type="button" aria-pressed={filter === 'resolved'} onClick={() => setFilter('resolved')}>Decided</button></div></div>
    {loading ? <div className="state-card" role="status">Opening the library…</div> : error ? <div className="state-card state-error" role="alert"><BookOpen size={29} aria-hidden="true" /><h2>Live worlds are not available yet.</h2><p>{error}</p><button type="button" className="button button-outline" onClick={reload}>Try again</button></div> : filtered.length ? <div className="world-grid">{filtered.map((world) => <Link className="world-card" key={world.id} to={`/worlds/${encodeURIComponent(world.id)}`}><div className="world-card-top"><span className="eyebrow">WORLD / {world.id}</span><span className="status-pill">{statusLabel(world.status)}</span></div><h2>{world.title}</h2><p>Two invited writers. One shared question: do their scenes belong together?</p><div className="world-card-bottom"><span>Opened {formatDate(world.createdAt)}</span><span className="card-arrow"><ArrowRight size={19} aria-hidden="true" /></span></div></Link>)}</div> : <div className="state-card"><BookOpen size={29} aria-hidden="true" /><h2>{query || filter !== 'all' ? 'No worlds match those filters.' : 'No worlds have been opened yet.'}</h2><p>{query || filter !== 'all' ? 'Try another title or show all worlds.' : 'The first story begins when a host creates and funds a world.'}</p><Link className="button button-primary" to="/worlds/new">Start a world <ArrowRight size={18} aria-hidden="true" /></Link></div>}
  </div>
}
