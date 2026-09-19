import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import type { TransactionProgress, WorldDetail } from '../domain'
import { formatDate } from '../domain'
import { TransactionNotice } from '../components/TransactionNotice'
import { contractConfigured, gateway } from '../lib/contract'
import { useWallet } from '../lib/wallet'

export default function WriteScene() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const slot = params.get('slot') === 'B' ? 'B' : 'A'
  const wallet = useWallet()
  const navigate = useNavigate()
  const [world, setWorld] = useState<WorldDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [progress, setProgress] = useState<TransactionProgress>({ stage: 'idle' })
  const [busy, setBusy] = useState(false)
  useEffect(() => { void gateway.getWorld(id).then(setWorld).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'World unavailable.')).finally(() => setLoading(false)) }, [id])
  const assigned = slot === 'A' ? world?.writerA : world?.writerB
  const branch = slot === 'A' ? world?.branchA : world?.branchB
  const eligible = Boolean(world && wallet.address && assigned?.toLowerCase() === wallet.address.toLowerCase() && !branch && world.status === 'OPEN' && Date.now() < world.submitDeadline * 1000)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (text.trim().length < 30 || text.length > 1200) { setFormError('Write a scene of 30–1,200 characters.'); return }
    setFormError(null)
    if (!eligible || !wallet.address || !contractConfigured) return
    if (!wallet.networkReady && !(await wallet.ensureNetwork())) return
    setBusy(true)
    try { await gateway.submitBranch({ worldId: id, slot, text: text.trim() }, wallet.address, setProgress); navigate(`/worlds/${encodeURIComponent(id)}`) }
    catch (cause) { setProgress({ stage: 'failed', message: cause instanceof Error ? cause.message : 'Scene submission failed. Check the world before trying again.' }) }
    finally { setBusy(false) }
  }

  return <div className="container page-wrap"><Link className="back-link" to={`/worlds/${encodeURIComponent(id)}`}><ArrowLeft size={17} aria-hidden="true" /> Back to world</Link>{loading ? <div className="state-card" role="status">Opening the writing desk…</div> : error || !world ? <div className="state-card state-error"><h1 tabIndex={-1}>The writing desk is unavailable.</h1><p>{error}</p></div> : <><div className="page-intro narrow"><span className="eyebrow">WORLD / {world.id} / WRITER {slot}</span><h1 tabIndex={-1}>Write your scene.</h1><p>Your scene will begin from the same canon as the other writer's. It is public after you submit it.</p></div><div className="writing-layout"><div className="writing-main"><div className="context-card"><span className="eyebrow">BEFORE YOUR SCENE</span><h2>{world.title}</h2><p>{world.canon}</p><div className="canon-rules"><strong>Keep this rule</strong><span>{world.rules}</span></div></div>{!wallet.address && <div className="state-card small-state"><h2>Connect your wallet to write.</h2><p>Only the invited writer for this slot can submit a scene.</p><button type="button" className="button button-primary" onClick={wallet.openModal}>Choose a wallet</button></div>}{wallet.address && !eligible && <div className="notice" role="status">{branch ? 'This writer has already submitted a scene.' : world.status !== 'OPEN' ? 'This round is no longer accepting scenes.' : Date.now() >= world.submitDeadline * 1000 ? 'The scene deadline has passed.' : 'The connected wallet is not assigned to this writing slot.'}</div>}<form className="scene-form" onSubmit={(event) => void submit(event)}><label htmlFor="scene-text">Your scene</label><p className="field-hint">Describe what changes. Keep the timeline and world rule clear so the two scenes can be compared.</p><textarea id="scene-text" rows={11} value={text} onChange={(event) => setText(event.target.value)} placeholder="At the edge of the river, a new voice arrives…" maxLength={1200} disabled={!eligible || busy || !contractConfigured} aria-invalid={Boolean(formError)} aria-describedby={formError ? 'scene-error' : undefined} />{formError && <span id="scene-error" className="form-error" role="alert">{formError}</span>}<div className="scene-form-foot"><span className="field-hint">{text.length}/1,200 characters · Due {formatDate(world.submitDeadline)}</span><button type="submit" className="button button-primary" disabled={!eligible || busy || !contractConfigured}>{busy ? 'Waiting for wallet…' : 'Submit scene'} <ArrowRight size={17} aria-hidden="true" /></button></div>{!contractConfigured && <p className="availability-note">Scene submission is unavailable until the contract is deployed. No onchain scene has been created.</p>}</form><TransactionNotice progress={progress} /></div><aside className="writing-aside"><div className="aside-card"><PenLine size={27} aria-hidden="true" /><h2>A good branch makes a clear change.</h2><p>Give your scene enough detail for readers and validators to follow what happened and when. Your words are compared as story content; instructions to the validator have no authority.</p><p className="small-print">The other writer's submitted scene and the final result can be revisited on the world page.</p></div></aside></div></>}</div>
}
