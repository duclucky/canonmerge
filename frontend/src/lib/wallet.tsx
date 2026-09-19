import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { isAddress } from '../domain'
import { studioDevnet } from 'genlayer-js/chains'

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on?(event: string, listener: (...args: unknown[]) => void): void
  removeListener?(event: string, listener: (...args: unknown[]) => void): void
  providers?: Eip1193Provider[]
  isMetaMask?: boolean
  isRabby?: boolean
  isCoinbaseWallet?: boolean
  isBraveWallet?: boolean
  isOkxWallet?: boolean
}

interface AnnouncedWallet {
  info: { uuid: string; name: string; icon?: string; rdns?: string }
  provider: Eip1193Provider
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
    okxwallet?: { ethereum?: Eip1193Provider }
    rabby?: { ethereum?: Eip1193Provider }
    coinbaseWalletExtension?: Eip1193Provider
  }
  interface WindowEventMap {
    'eip6963:announceProvider': CustomEvent<AnnouncedWallet>
  }
}

export interface WalletChoice {
  id: string
  name: string
  icon?: string
  provider: Eip1193Provider
}

interface WalletContextValue {
  choices: WalletChoice[]
  address: string | null
  provider: Eip1193Provider | null
  chainId: number | null
  expectedChainId: number
  networkReady: boolean
  networkMessage: string | null
  modalOpen: boolean
  pending: boolean
  error: string | null
  openModal(): void
  closeModal(): void
  connect(choice: WalletChoice): Promise<void>
  disconnect(): void
  ensureNetwork(): Promise<boolean>
}

const WalletContext = createContext<WalletContextValue | null>(null)
const expectedChainId = studioDevnet.id
const walletRpcUrl = studioDevnet.rpcUrls.default.http[0]

let activeWalletSession: { account: string; provider: Eip1193Provider } | null = null
export function getActiveWalletSession() { return activeWalletSession }

export async function ensureStudioNetwork(provider: Eip1193Provider): Promise<void> {
  const chainId = `0x${studioDevnet.id.toString(16)}`
  try { await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] }) }
  catch (cause) {
    const code = typeof cause === 'object' && cause !== null && 'code' in cause ? Number(cause.code) : 0
    if (code !== 4902 && code !== -32603) throw cause
    await provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId, chainName: studioDevnet.name, nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 }, rpcUrls: [walletRpcUrl] }] })
  }
  const current = await provider.request({ method: 'eth_chainId' })
  if (String(current).toLowerCase() !== chainId.toLowerCase()) throw new Error(`Switch to ${studioDevnet.name} before signing.`)
}

function fallbackName(provider: Eip1193Provider): string {
  if (provider.isRabby) return 'Rabby'
  if (provider.isOkxWallet) return 'OKX Wallet'
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet'
  if (provider.isBraveWallet) return 'Brave Wallet'
  if (provider.isMetaMask) return 'MetaMask'
  return 'Browser wallet'
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [choices, setChoices] = useState<WalletChoice[]>([])
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<Eip1193Provider | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const add = (next: WalletChoice) => {
      setChoices((current) => current.some((item) => item.provider === next.provider || item.id === next.id) ? current : [...current, next])
    }
    const onAnnounce = (event: CustomEvent<AnnouncedWallet>) => {
      const { info, provider: announced } = event.detail
      if (info?.name) add({ id: info.uuid || info.rdns || info.name, name: info.name, icon: info.icon, provider: announced })
    }
    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    const fallback = window.setTimeout(() => {
      const candidates = [window.ethereum, ...(window.ethereum?.providers ?? []), window.okxwallet?.ethereum, window.rabby?.ethereum, window.coinbaseWalletExtension]
      candidates.forEach((item, index) => {
        if (item?.request) add({ id: `injected-${index}`, name: fallbackName(item), provider: item })
      })
    }, 600)
    return () => {
      window.clearTimeout(fallback)
      window.removeEventListener('eip6963:announceProvider', onAnnounce)
    }
  }, [])

  useEffect(() => {
    if (!provider) return
    const onAccounts = (next: unknown) => {
      const first = Array.isArray(next) ? next[0] : null
      setAddress(typeof first === 'string' && isAddress(first) ? first : null)
    }
    const onChain = (hex: unknown) => setChainId(typeof hex === 'string' ? Number.parseInt(hex, 16) : null)
    provider.on?.('accountsChanged', onAccounts)
    provider.on?.('chainChanged', onChain)
    return () => {
      provider.removeListener?.('accountsChanged', onAccounts)
      provider.removeListener?.('chainChanged', onChain)
    }
  }, [provider])

  const disconnect = useCallback(() => {
    activeWalletSession = null
    setAddress(null)
    setProvider(null)
    setChainId(null)
    setError(null)
    setModalOpen(false)
  }, [])

  const connect = useCallback(async (choice: WalletChoice) => {
    setPending(true)
    setError(null)
    try {
      const accounts = await choice.provider.request({ method: 'eth_requestAccounts' })
      const next = Array.isArray(accounts) ? accounts[0] : null
      if (typeof next !== 'string' || !isAddress(next)) throw new Error('The wallet did not provide a valid EVM address.')
      const rawChain = await choice.provider.request({ method: 'eth_chainId' })
      setProvider(choice.provider)
      setAddress(next)
      activeWalletSession = { account: next, provider: choice.provider }
      setChainId(typeof rawChain === 'string' ? Number.parseInt(rawChain, 16) : null)
      setModalOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Wallet connection was declined or failed.')
    } finally {
      setPending(false)
    }
  }, [])

  const ensureNetwork = useCallback(async () => {
    if (!provider || !address) return false
    if (!walletRpcUrl) {
      setError('The Studio Dev wallet RPC is not configured yet. Writing is unavailable.')
      return false
    }
    try {
      await ensureStudioNetwork(provider)
      setChainId(expectedChainId)
      setError(null)
      return true
    } catch (cause) {
      const code = typeof cause === 'object' && cause !== null && 'code' in cause ? Number(cause.code) : 0
      if (code === 4902) {
        try {
          await provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId: `0x${expectedChainId.toString(16)}`, chainName: studioDevnet.name, nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 }, rpcUrls: [walletRpcUrl] }] })
          setChainId(expectedChainId)
          setError(null)
          return true
        } catch (addCause) {
          setError(addCause instanceof Error ? addCause.message : 'Network setup failed.')
          return false
        }
      }
      setError(cause instanceof Error ? cause.message : 'Network switch was declined or failed.')
      return false
    }
  }, [provider, address])

  const networkReady = Boolean(provider && address && walletRpcUrl && chainId === expectedChainId)
  const networkMessage = !walletRpcUrl ? 'Wallet RPC configuration is pending.' : chainId !== null && chainId !== expectedChainId ? 'Switch to GenLayer Studio Dev to write.' : null
  const value = useMemo(() => ({ choices, address, provider, chainId, expectedChainId, networkReady, networkMessage, modalOpen, pending, error, openModal: () => setModalOpen(true), closeModal: () => setModalOpen(false), connect, disconnect, ensureNetwork }), [choices, address, provider, chainId, networkReady, networkMessage, modalOpen, pending, error, connect, disconnect, ensureNetwork])
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletContextValue {
  const value = useContext(WalletContext)
  if (!value) throw new Error('WalletProvider is missing')
  return value
}
