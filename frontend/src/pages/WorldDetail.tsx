import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, GitBranch, GitMerge, PenLine, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router'
import type { TransactionProgress, WorldDetail as World } from '../domain'
import { formatDate, shortAddress, statusLabel } from '../domain'
import { TransactionNotice } from '../components/TransactionNotice'
import { contractConfigured, gateway } from '../lib/contract'
import { useWallet } from '../lib/wallet'

export default function WorldDetail() {
  const { id = '' } = useParams()
  const wallet = useWallet()
  const [world, setWorld] = useState<World | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<TransactionProgress>({ stage: 'idle' })
  const [busy, setBusy] = useState(false)
  const reload = () => { setLoading(true); setError(null); void gateway.getWorld(id).then(setWorld).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'This world could not be loaded.')).finally(() => setLoading(false)) }
  useEffect(reload, [id])
  const lower = wallet.address?.toLowerCase()
  const isSponsor = world?.sponsor.toLowerCase() === lower
  const isWriterA = world?.writerA.toLowerCase() === lower
  const isWriterB = world?.writerB.toLowerCase() === lower
  const interested = isSponsor || isWriterA || isWriterB
  const canWriteA = Boolean(isWriterA && !world?.branchA && world?.status === 'OPEN' && Date.now() < (world?.submitDeadline ?? 0) * 1000)
  const canWriteB = Boolean(isWriterB && !world?.branchB && world?.status === 'OPEN' && Date.now() < (world?.submitDeadline ?? 0) * 1000)
  const canReview = Boolean(interested && world?.status === 'READY' && Date.now() < (world?.reviewDeadline ?? 0) * 1000)
  const canRecover = Boolean(interested && (world?.status === 'REFUNDABLE' || (world?.status === 'OPEN' && Date.now() >= (world?.submitDeadline ?? 0) * 1000) || (world?.status === 'RETRYABLE' && Date.now() >= (world?.reviewDeadline ?? 0) * 1000)))

  async function transact(action: 'review' | 'recover') {
    if (!wallet.address || !world || !contractConfigured) return
    if (!wallet.networkReady && !(await wallet.ensureNetwork())) return
    setBusy(true)
    try {
      if (action === 'review') await gateway.reviewWorld(world.id, wallet.address, setProgress)
      else await gateway.recoverWorld(world.id, wallet.address, setProgress)
      reload()
    } catch (cause) { setProgress({ stage: 'failed', message: cause instanceof Error ? cause.message : 'The transaction failed. Check canonical state before trying again.' }) }
    finally { setBusy(false) }
  }

  return <div className="container page-wrap"><Link className="back-link" to="/worlds"><ArrowLeft size={17} aria-hidden="true" /> All worlds</Link>{loading ? <div className="state-card" role="status">Opening this world…</div> : error || !world ? <div className="state-card state-error"><BookOpen size={30} aria-hidden="true" /><h1 tabIndex={-1}>This world is not available.</h1><p>{error || 'The world could not be found.'}</p><button className="button button-outline" type="button" onClick={reload}>Try again</button></div> : <>
    <div className="world-intro"><div><span className="eyebrow">WORLD / {world.id}</span><h1 tabIndex={-1}>{world.title}</h1><div className="world-meta"><span className="status-pill">{statusLabel(world.status)}</span><span>Opened {formatDate(world.createdAt)}</span></div></div><div className="world-intro-action"><Link className="button button-outline" to={`/worlds/${encodeURIComponent(id)}/outcome`}>Outcome & history <ArrowRight size={17} aria-hidden="true" /></Link></div></div>
    <div className="world-layout"><div className="world-main"><article className="canon-paper"><span className="eyebrow">THE STARTING CANON</span><div className="canon-ornament" aria-hidden="true">✦</div><p>{world.canon}</p><div className="canon-rules"><strong>The world's rule</strong><span>{world.rules}</span></div></article><section className="branch-section"><div className="section-heading compact"><div><span className="eyebrow">TWO VOICES</span><h2>The next scenes</h2></div><p>Both writers start from this same canon. Their exact scenes become public after submission.</p></div><div className="branch-grid">{(['A', 'B'] as const).map((slot) => { const branch = slot === 'A' ? world.branchA : world.branchB; const eligible = slot === 'A' ? canWriteA : canWriteB; return <div className="branch-card" key={slot}><span className="branch-letter">{slot}</span><span className="eyebrow">WRITER {slot}</span><h3>{branch ? 'A scene has been submitted' : 'A scene is still unwritten'}</h3><p className="branch-author">{shortAddress(slot === 'A' ? world.writerA : world.writerB)}</p>{branch ? <p className="branch-excerpt">{branch.text}</p> : <p>We are waiting for this writer to add their part.</p>}{eligible && <Link className="button button-small button-primary" to={`/worlds/${encodeURIComponent(id)}/write?slot=${slot}`}>Write scene <PenLine size={16} aria-hidden="true" /></Link>}</div> })}</div></section></div><aside className="world-aside"><div className="aside-card sticky-card"><span className="eyebrow">THIS ROUND</span><h2>What happens next?</h2><div className="timeline-mini"><div><span className="timeline-dot active" /><p><strong>Scenes due</strong><br />{formatDate(world.submitDeadline)}</p></div><div><span className="timeline-dot" /><p><strong>Review closes</strong><br />{formatDate(world.reviewDeadline)}</p></div><div><span className="timeline-dot" /><p><strong>Decision</strong><br />{world.result === 'MERGEABLE' ? 'One shared canon' : world.result === 'CONFLICTING' ? 'Two separate paths' : 'Waiting for the story'}</p></div></div>{canReview && <button className="button button-primary full-width" type="button" disabled={busy} onClick={() => void transact('review')}>Compare scenes <GitMerge size={18} aria-hidden="true" /></button>}{world.status === 'RETRYABLE' && <div className="inline-note"><RefreshCw size={17} aria-hidden="true" /><span>The review needs another try. No GEN or story rights moved.</span></div>}{canRecover && <button className="button button-outline full-width" type="button" disabled={busy} onClick={() => void transact('recover')}>Recover 2 GEN</button>}{(world.status === 'MERGED' || world.status === 'FORKED') && <Link className="button button-primary full-width" to={`/worlds/${encodeURIComponent(id)}/outcome`}>See the result <GitBranch size={18} aria-hidden="true" /></Link>}{!wallet.address && <button type="button" className="text-link" onClick={wallet.openModal}>Connect to see your writing actions</button>}<p className="small-print">The result and any GEN credit appear here only after finalization and a fresh contract read.</p></div></aside></div><TransactionNotice progress={progress} />
  </>}</div>
}
