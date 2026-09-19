import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, GitBranch, GitMerge, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router'
import type { TransactionProgress, WorldDetail } from '../domain'
import { formatDate, shortAddress } from '../domain'
import { TransactionNotice } from '../components/TransactionNotice'
import { contractConfigured, gateway } from '../lib/contract'
import { useWallet } from '../lib/wallet'

export default function Outcome() {
  const { id = '' } = useParams()
  const wallet = useWallet()
  const [world, setWorld] = useState<WorldDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [credit, setCredit] = useState<string | null>(null)
  const [progress, setProgress] = useState<TransactionProgress>({ stage: 'idle' })
  const [busy, setBusy] = useState(false)

  function reload() {
    setLoading(true)
    setError(null)
    void gateway.getWorld(id).then(setWorld).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Outcome unavailable.')).finally(() => setLoading(false))
    if (wallet.address) void gateway.getAccount(wallet.address).then((item) => setCredit(item.creditGen)).catch(() => setCredit(null))
  }

  useEffect(reload, [id, wallet.address])
  const ownCredit = credit !== null && Number(credit) > 0

  async function withdraw() {
    if (!wallet.address || !ownCredit || !contractConfigured) return
    if (!wallet.networkReady && !(await wallet.ensureNetwork())) return
    setBusy(true)
    try { await gateway.withdraw(wallet.address, setProgress); reload() }
    catch (cause) { setProgress({ stage: 'failed', message: cause instanceof Error ? cause.message : 'Withdrawal failed. Check your canonical credit before retrying.' }) }
    finally { setBusy(false) }
  }

  if (loading) return <div className="container page-wrap"><div className="state-card" role="status">Reading the story's outcome…</div></div>
  if (error || !world) return <div className="container page-wrap"><div className="state-card state-error"><h1 tabIndex={-1}>Outcome unavailable.</h1><p>{error}</p></div></div>

  const headline = world.result === 'MERGEABLE' ? 'One story, two voices.' : world.result === 'CONFLICTING' ? 'The story found two paths.' : 'The decision is still ahead.'
  const lede = world.result === 'MERGEABLE' ? 'The scenes can share one canon. Both writers have a continuation right and 1 GEN credit.' : world.result === 'CONFLICTING' ? "The scenes cannot coexist in one chronology. Each writer's path stays separate; the host receives a 2 GEN refund credit." : 'A validator decision has not finalized. No story rights or GEN credit can be inferred from a pending attempt.'

  return <div className="container page-wrap">
    <Link className="back-link" to={`/worlds/${encodeURIComponent(id)}`}><ArrowLeft size={17} aria-hidden="true" /> Back to world</Link>
    <div className="page-intro"><span className="eyebrow">WORLD / {world.id} / OUTCOME</span><h1 tabIndex={-1}>{headline}</h1><p>{lede}</p></div>
    <div className="outcome-layout"><div className="outcome-main">
      <div className="outcome-symbol" aria-hidden="true">{world.result === 'MERGEABLE' ? <GitMerge size={36} strokeWidth={1.5} /> : world.result === 'CONFLICTING' ? <GitBranch size={36} strokeWidth={1.5} /> : <RefreshCw size={36} strokeWidth={1.5} />}</div>
      <section className="chapter-map"><div className="parent-node"><span className="eyebrow">THE PARENT CANON</span><h2>{world.title}</h2><p>{world.canon}</p></div><div className={`branch-connector ${world.result === 'MERGEABLE' ? 'connector-merge' : ''}`} aria-hidden="true"><span /><span /></div><div className="outcome-branches">{(['A', 'B'] as const).map((slot) => { const branch = slot === 'A' ? world.branchA : world.branchB; return <article className="outcome-branch" key={slot}><span className="eyebrow">VOICE {slot} · {shortAddress(slot === 'A' ? world.writerA : world.writerB)}</span><h3>{branch ? `Scene ${slot}` : 'Scene not submitted'}</h3><p>{branch?.text || 'This writing slot is still empty.'}</p></article> })}</div>{world.result && <div className="result-node"><span className="eyebrow">FINALIZED STORY STATE</span><h3>{world.result === 'MERGEABLE' ? 'A shared chapter' : 'Two independent forks'}</h3><p>{world.result === 'MERGEABLE' ? 'Both scenes remain in one canon, in a fixed A-then-B display order. Writers share the right to continue it.' : 'Each scene becomes its own child path from the same parent. Neither is silently discarded.'}</p></div>}</section>
      <section className="history-panel"><span className="eyebrow">ROUND HISTORY</span><h2>What happened</h2><ol><li>World opened on {formatDate(world.createdAt)} with a 2 GEN purse.</li><li>Writer A: {world.branchA ? `scene submitted ${formatDate(world.branchA.submittedAt)}` : 'waiting for a scene'}.</li><li>Writer B: {world.branchB ? `scene submitted ${formatDate(world.branchB.submittedAt)}` : 'waiting for a scene'}.</li><li>{world.result ? `Validator decision finalized: ${world.result === 'MERGEABLE' ? 'shared canon' : 'two forks'}.` : world.status === 'RETRYABLE' ? 'A review attempt could not be verified; the purse and canon remain unchanged.' : 'Validator decision pending.'}</li></ol></section>
    </div><aside className="outcome-aside"><div className="aside-card sticky-card"><span className="eyebrow">YOUR PART</span><h2>Story & GEN</h2>{world.result === 'MERGEABLE' ? <p>Each writer is eligible for 1 GEN after the merge finalizes.</p> : world.result === 'CONFLICTING' ? <p>The sponsor is eligible to withdraw the 2 GEN refund after the fork finalizes.</p> : <p>No credit has been created by a pending or retryable review.</p>}{wallet.address ? <><div className="credit-row"><span>Your canonical credit</span><strong>{credit === null ? 'Unavailable' : `${credit} GEN`}</strong></div>{ownCredit && <button type="button" className="button button-primary full-width" disabled={busy || !contractConfigured} onClick={() => void withdraw()}>{busy ? 'Waiting for wallet…' : 'Withdraw credit'} <ArrowRight size={17} aria-hidden="true" /></button>}</> : <button className="button button-outline full-width" type="button" onClick={wallet.openModal}>Connect to check credit</button>}<Link className="text-link" to="/account">Wallet & credits <ArrowRight size={17} aria-hidden="true" /></Link><p className="small-print">Only canonical contract reads confirm a result or balance. The page never estimates gas, fees, or finality.</p></div></aside></div>
    <TransactionNotice progress={progress} />
  </div>
}
