import { ArrowUpRight, CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react'
import type { TransactionProgress } from '../domain'

export function TransactionNotice({ progress }: { progress: TransactionProgress }) {
  if (progress.stage === 'idle') return null
  const heading = {
    submitted: 'Transaction submitted', accepted: 'Decision accepted', finalized: 'Finalized on Studio Dev', failed: 'Transaction failed', retryable: 'Review can be retried', idle: '',
  }[progress.stage]
  const explorer = import.meta.env.VITE_EXPLORER_URL || 'https://explorer-studio-dev.genlayer.com'
  const icon = progress.stage === 'failed' ? <CircleAlert size={21} /> : progress.stage === 'finalized' ? <CheckCircle2 size={21} /> : <LoaderCircle className="spin" size={21} />
  return <div className={`transaction-notice transaction-${progress.stage}`} role="status" aria-live="polite"><div className="transaction-icon">{icon}</div><div><strong>{heading}</strong>{progress.message && <p>{progress.message}</p>}{progress.hash && <a href={`${explorer.replace(/\/$/, '')}/tx/${progress.hash}`} target="_blank" rel="noreferrer">View transaction <ArrowUpRight size={15} aria-hidden="true" /></a>}</div></div>
}
