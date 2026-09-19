import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { ArrowRight, BookOpen, ChevronDown, Menu, Wallet, X } from 'lucide-react'
import { shortAddress } from '../domain'
import { contractConfigured } from '../lib/contract'
import { useWallet } from '../lib/wallet'
import type { WalletChoice } from '../lib/wallet'

function WalletModal() {
  const wallet = useWallet()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!wallet.modalOpen) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') wallet.closeModal()
      if (event.key === 'Tab') {
        const focusable = Array.from(document.querySelectorAll<HTMLElement>('.wallet-dialog button:not(:disabled)'))
        const first = focusable[0]
        const last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [wallet.modalOpen, wallet.closeModal])
  if (!wallet.modalOpen) return null
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) wallet.closeModal() }}>
    <div className="wallet-dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-title">
      <div className="dialog-top"><div><span className="eyebrow">Choose your wallet</span><h2 id="wallet-title">Connect to write your part</h2></div><button ref={closeRef} className="icon-button" type="button" aria-label="Close wallet selection" onClick={wallet.closeModal}><X size={22} aria-hidden="true" /></button></div>
      <p>CanonMerge checks the wallets available in this browser. Choose the one you want to use; no wallet is selected for you.</p>
      {wallet.choices.length ? <div className="wallet-list">{wallet.choices.map((choice: WalletChoice) => <button className="wallet-choice" key={choice.id} type="button" disabled={wallet.pending} onClick={() => void wallet.connect(choice)}>{choice.icon?.startsWith('data:image/') ? <img src={choice.icon} alt="" /> : <Wallet size={23} aria-hidden="true" />}<span>{choice.name}</span><ArrowRight size={17} aria-hidden="true" /></button>)}</div> : <div className="notice">No EVM wallet extension was found. Install a compatible wallet, then reopen this panel.</div>}
      {wallet.error && <p className="form-error" role="alert">{wallet.error}</p>}
      <p className="small-print">Your wallet may ask you to approve the connection. Connecting alone does not spend GEN.</p>
    </div>
  </div>
}

export function Shell({ children }: { children: ReactNode }) {
  const wallet = useWallet()
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const nav = [<NavLink key="worlds" to="/worlds" onClick={() => setMobileOpen(false)}>Explore worlds</NavLink>, <NavLink key="new" to="/worlds/new" onClick={() => setMobileOpen(false)}>Start a world</NavLink>, <NavLink key="help" to="/help" onClick={() => setMobileOpen(false)}>How it works</NavLink>]
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="header-inner container">
      <Link className="brand" to="/" aria-label="CanonMerge home"><span className="brand-mark" aria-hidden="true"><BookOpen size={23} strokeWidth={1.8} /></span><span>Canon<span className="brand-accent">Merge</span></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{nav}</nav>
      <div className="header-actions">
        {wallet.address ? <div className="account-wrapper"><button type="button" className="account-trigger" aria-expanded={accountOpen} aria-haspopup="menu" onClick={() => setAccountOpen((value) => !value)}><span className="wallet-dot" />{shortAddress(wallet.address)}<ChevronDown size={16} aria-hidden="true" /></button>{accountOpen && <div className="account-menu" role="menu"><Link role="menuitem" to="/account" onClick={() => setAccountOpen(false)}>Wallet & credits</Link><button role="menuitem" type="button" onClick={() => { wallet.disconnect(); setAccountOpen(false) }}>Disconnect wallet</button></div>}</div> : <button type="button" className="connect-button" onClick={wallet.openModal}><Wallet size={17} aria-hidden="true" />Connect wallet</button>}
        <button className="mobile-menu-button icon-button" type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </div>{mobileOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{nav}<Link to="/account" onClick={() => setMobileOpen(false)}>Wallet & credits</Link></nav>}</header>
    {!contractConfigured && <div className="configuration-bar" role="status"><div className="container"><span className="configuration-dot" />Studio Dev contract connection is pending. You can explore the app; live worlds and writes will appear after deployment.</div></div>}
    {wallet.networkMessage && wallet.address && <div className="network-bar" role="status"><div className="container">{wallet.networkMessage} {wallet.provider && <button type="button" onClick={() => void wallet.ensureNetwork()}>Set up network</button>}</div></div>}
    <main id="main">{children}</main>
    <footer className="site-footer"><div className="container footer-grid"><div><Link className="brand footer-brand" to="/"><span className="brand-mark" aria-hidden="true"><BookOpen size={20} /></span><span>CanonMerge</span></Link><p>Every shared story begins with a choice that everyone can see.</p></div><div><span className="footer-heading">Explore</span><Link to="/worlds">Worlds</Link><Link to="/worlds/new">Start a world</Link><Link to="/help">How it works</Link></div><div><span className="footer-heading">The network</span><span>GenLayer Studio Dev</span><span>All submitted scenes are public.</span><span>Only wallet-signed writes can change canon.</span></div></div><div className="container footer-bottom">A creative world experiment powered by validator consensus. Fictional canon does not prove offchain authorship or publication.</div></footer>
    <WalletModal />
  </>
}
