import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, LogOut, Wallet } from 'lucide-react'
import { Link } from 'react-router'
import type { AccountOverview, TransactionProgress } from '../domain'
import { shortAddress, statusLabel } from '../domain'
import { TransactionNotice } from '../components/TransactionNotice'
import { contractConfigured, gateway } from '../lib/contract'
import { useWallet } from '../lib/wallet'

export default function Account() {
  const wallet = useWallet()
  const [data, setData] = useState<AccountOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<TransactionProgress>({ stage: 'idle' })
  const [busy, setBusy] = useState(false)
  const reload = () => { if (!wallet.address) { setData(null); return }; setLoading(true); setError(null); void gateway.getAccount(wallet.address).then(setData).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Account data could not be loaded.')).finally(() => setLoading(false)) }
  useEffect(reload, [wallet.address])
  async function withdraw() {
    if (!wallet.address || !data || Number(data.creditGen) <= 0 || !contractConfigured) return
    if (!wallet.networkReady && !(await wallet.ensureNetwork())) return
    setBusy(true)
    try { await gateway.withdraw(wallet.address, setProgress); reload() }
    catch (cause) { setProgress({ stage: 'failed', message: cause instanceof Error ? cause.message : 'Withdrawal failed. Check canonical credit before retrying.' }) }
    finally { setBusy(false) }
  }
  return <div className="container page-wrap"><div className="page-intro"><span className="eyebrow">YOUR ACCOUNT</span><h1 tabIndex={-1}>Your stories, your rights.</h1><p>See the worlds linked to your wallet and any GEN credit you can withdraw.</p></div>{!wallet.address ? <div className="state-card"><Wallet size={29} aria-hidden="true" /><h2>Connect a wallet to see your part.</h2><p>Your worlds and credit come from the contract, not this browser.</p><button type="button" className="button button-primary" onClick={wallet.openModal}>Choose a wallet</button></div> : <><div className="account-grid"><div className="account-card"><span className="eyebrow">CONNECTED WALLET</span><h2>{shortAddress(wallet.address)}</h2><p className="address-full">{wallet.address}</p><p>Network: {wallet.chainId === wallet.expectedChainId ? 'GenLayer Studio Dev' : wallet.chainId === null ? 'Unknown' : `Chain ${wallet.chainId} — switch to Studio Dev for writes`}</p><button className="text-link" type="button" onClick={wallet.disconnect}><LogOut size={17} aria-hidden="true" /> Disconnect wallet</button></div><div className="account-card credit-card"><span className="eyebrow">AVAILABLE CREDIT</span><h2>{data ? `${data.creditGen} GEN` : loading ? 'Loading…' : 'Unavailable'}</h2><p>Credits are created only by a finalized contract decision and can be withdrawn once.</p><button className="button button-primary" type="button" disabled={!data || Number(data.creditGen) <= 0 || busy || !contractConfigured} onClick={() => void withdraw()}>{busy ? 'Waiting for wallet…' : 'Withdraw available credit'} <ArrowRight size={17} aria-hidden="true" /></button></div></div>{error && <div className="notice error-notice" role="alert">{error} <button type="button" onClick={reload}>Try again</button></div>}<section className="account-worlds"><div className="section-heading compact"><div><span className="eyebrow">YOUR LIBRARY</span><h2>Worlds you are part of</h2></div></div>{loading ? <div className="state-card" role="status">Reading your worlds…</div> : data?.worlds.length ? <div className="account-list">{data.worlds.map((world) => <Link key={world.id} to={`/worlds/${encodeURIComponent(world.id)}`}><BookOpen size={20} aria-hidden="true" /><span><strong>{world.title}</strong><small>{statusLabel(world.status)}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>)}</div> : !error && <div className="state-card small-state"><h3>No linked worlds yet.</h3><p>Browse public worlds or start one with two invited writers.</p><Link className="button button-outline" to="/worlds">Explore worlds</Link></div>}</section><TransactionNotice progress={progress} /></>}</div>
}
