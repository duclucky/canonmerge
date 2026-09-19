import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CircleAlert, LockKeyhole, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { isAddress } from '../domain'
import type { TransactionProgress } from '../domain'
import { TransactionNotice } from '../components/TransactionNotice'
import { contractConfigured, gateway } from '../lib/contract'
import { useWallet } from '../lib/wallet'

export default function NewWorld() {
  const wallet = useWallet()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [canon, setCanon] = useState('')
  const [rules, setRules] = useState('')
  const [writerA, setWriterA] = useState('')
  const [writerB, setWriterB] = useState('')
  const [submitDeadline, setSubmitDeadline] = useState('')
  const [reviewDeadline, setReviewDeadline] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState<TransactionProgress>({ stage: 'idle' })
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (title.trim().length < 4 || title.trim().length > 80) next.title = 'Choose a title of 4–80 characters.'
    if (canon.trim().length < 40 || canon.length > 1800) next.canon = 'Write 40–1,800 characters of starting canon.'
    if (rules.trim().length < 20 || rules.length > 800) next.rules = 'Write 20–800 characters of world rules.'
    if (!isAddress(writerA)) next.writerA = 'Enter a valid EVM address for writer A.'
    if (!isAddress(writerB)) next.writerB = 'Enter a valid EVM address for writer B.'
    if (writerA.toLowerCase() === writerB.toLowerCase() && writerA) next.writerB = 'The two writers need distinct wallets.'
    if (wallet.address && [writerA, writerB].some((value) => value.toLowerCase() === wallet.address?.toLowerCase())) next.writerA = 'The sponsor needs a different wallet from both writers.'
    const submitAt = Date.parse(submitDeadline)
    const reviewAt = Date.parse(reviewDeadline)
    if (!Number.isFinite(submitAt) || submitAt <= Date.now()) next.submitDeadline = 'Choose a future scene deadline.'
    if (!Number.isFinite(reviewAt) || reviewAt <= submitAt) next.reviewDeadline = 'Review must end after scene submission.'
    setErrors(next)
    if (Object.keys(next).length) { document.getElementById('form-errors')?.focus(); return }
    if (!wallet.address) { wallet.openModal(); return }
    if (!contractConfigured) { setProgress({ stage: 'failed', message: 'The contract has not been deployed. Your form remains here; no GEN was sent.' }); return }
    if (!wallet.networkReady && !(await wallet.ensureNetwork())) return
    setBusy(true)
    try {
      const worldId = await gateway.createWorld({ title: title.trim(), canon: canon.trim(), rules: rules.trim(), writerA, writerB, submitDeadline: Math.floor(submitAt / 1000), reviewDeadline: Math.floor(reviewAt / 1000) }, wallet.address, setProgress)
      navigate(`/worlds/${encodeURIComponent(worldId)}`)
    } catch (cause) {
      setProgress({ stage: 'failed', message: cause instanceof Error ? cause.message : 'World creation failed. Check the transaction before trying again.' })
    } finally { setBusy(false) }
  }

  return <div className="container page-wrap"><Link className="back-link" to="/worlds"><ArrowLeft size={17} aria-hidden="true" /> All worlds</Link><div className="page-intro narrow"><span className="eyebrow">START A WORLD</span><h1 tabIndex={-1}>Give two voices a beginning.</h1><p>Write the starting canon and invite two distinct writers. You will fund exactly 2 GEN for this round. All submitted text becomes public.</p></div><div className="form-layout"><form className="paper-form" onSubmit={(event) => void onSubmit(event)} noValidate>
    {Object.keys(errors).length > 0 && <div id="form-errors" className="error-summary" tabIndex={-1} role="alert"><CircleAlert size={19} aria-hidden="true" /><span>Review the highlighted fields before continuing.</span></div>}
    <section className="form-section"><div className="form-section-title"><span className="form-step">01</span><div><h2>Name the world</h2><p>Give readers a clear place to begin.</p></div></div><div className="field"><label htmlFor="world-title">World title</label><input id="world-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} placeholder="The River That Remembered" />{errors.title && <span className="form-error" id="title-error">{errors.title}</span>}<span className="field-hint">{title.length}/80 characters</span></div><div className="field"><label htmlFor="canon">Starting canon</label><textarea id="canon" rows={7} value={canon} onChange={(event) => setCanon(event.target.value)} maxLength={1800} aria-invalid={Boolean(errors.canon)} aria-describedby={errors.canon ? 'canon-error' : undefined} placeholder="Describe the world as it exists before either writer changes it…" />{errors.canon && <span className="form-error" id="canon-error">{errors.canon}</span>}<span className="field-hint">The facts both writers must preserve. {canon.length}/1,800 characters</span></div><div className="field"><label htmlFor="rules">World rules</label><textarea id="rules" rows={4} value={rules} onChange={(event) => setRules(event.target.value)} maxLength={800} aria-invalid={Boolean(errors.rules)} aria-describedby={errors.rules ? 'rules-error' : undefined} placeholder="What can and cannot change in this story?" />{errors.rules && <span className="form-error" id="rules-error">{errors.rules}</span>}<span className="field-hint">Keep rules specific enough for two people to interpret. {rules.length}/800 characters</span></div></section>
    <section className="form-section"><div className="form-section-title"><span className="form-step">02</span><div><h2>Invite two writers</h2><p>Each writer submits one independent branch from the same parent.</p></div></div><div className="field-grid"><div className="field"><label htmlFor="writer-a">Writer A wallet address</label><input id="writer-a" value={writerA} onChange={(event) => setWriterA(event.target.value)} aria-invalid={Boolean(errors.writerA)} aria-describedby={errors.writerA ? 'writer-a-error' : undefined} placeholder="0x…" spellCheck={false} />{errors.writerA && <span className="form-error" id="writer-a-error">{errors.writerA}</span>}</div><div className="field"><label htmlFor="writer-b">Writer B wallet address</label><input id="writer-b" value={writerB} onChange={(event) => setWriterB(event.target.value)} aria-invalid={Boolean(errors.writerB)} aria-describedby={errors.writerB ? 'writer-b-error' : undefined} placeholder="0x…" spellCheck={false} />{errors.writerB && <span className="form-error" id="writer-b-error">{errors.writerB}</span>}</div></div></section>
    <section className="form-section"><div className="form-section-title"><span className="form-step">03</span><div><h2>Set the writing window</h2><p>A round needs enough time for both scenes and a later review.</p></div></div><div className="field-grid"><div className="field"><label htmlFor="submit-deadline">Scenes due</label><input id="submit-deadline" type="datetime-local" value={submitDeadline} onChange={(event) => setSubmitDeadline(event.target.value)} aria-invalid={Boolean(errors.submitDeadline)} aria-describedby={errors.submitDeadline ? 'submit-error' : undefined} />{errors.submitDeadline && <span className="form-error" id="submit-error">{errors.submitDeadline}</span>}</div><div className="field"><label htmlFor="review-deadline">Review closes</label><input id="review-deadline" type="datetime-local" value={reviewDeadline} onChange={(event) => setReviewDeadline(event.target.value)} aria-invalid={Boolean(errors.reviewDeadline)} aria-describedby={errors.reviewDeadline ? 'review-error' : undefined} />{errors.reviewDeadline && <span className="form-error" id="review-error">{errors.reviewDeadline}</span>}</div></div></section>
    <TransactionNotice progress={progress} /><div className="form-actions"><Link className="text-link" to="/worlds">Cancel</Link><button type="submit" className="button button-primary" disabled={busy || !contractConfigured}>{busy ? 'Waiting for the wallet…' : wallet.address ? 'Fund world with 2 GEN' : 'Connect to continue'} <ArrowRight size={18} aria-hidden="true" /></button></div>{!contractConfigured && <p className="availability-note" role="status">World creation will be available when the Studio Dev contract is deployed. No transaction can be signed yet.</p>}
  </form><aside className="form-aside"><div className="aside-card"><BookOpen size={27} aria-hidden="true" /><h2>How this round works</h2><p>The two writers respond to the same canon. Validators check whether both changes can share a single story.</p><div className="aside-rule"><Users size={19} aria-hidden="true" /><span>A coherent pair gives each writer 1 GEN and a shared continuation right.</span></div><div className="aside-rule"><LockKeyhole size={19} aria-hidden="true" /><span>A conflict creates two forks and returns the 2 GEN purse to you.</span></div><p className="small-print">A failed or uncertain review does not move GEN or change canon. Eligible participants can retry or recover after the review window.</p></div></aside></div></div>
}
