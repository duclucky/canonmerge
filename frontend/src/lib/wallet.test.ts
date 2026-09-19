import { describe, expect, it } from 'vitest'
import { restoreAuthorizedWallet, type WalletChoice } from './wallet'

describe('wallet session restoration', () => {
  it('restores only an already-authorized account without requesting access', async () => {
    const methods: string[] = []
    const choice: WalletChoice = {
      id: 'okx',
      name: 'OKX Wallet',
      provider: {
        async request({ method }) {
          methods.push(method)
          if (method === 'eth_accounts') return ['0x1111111111111111111111111111111111111111']
          if (method === 'eth_chainId') return '0xf22d'
          throw new Error(`Unexpected ${method}`)
        },
      },
    }

    await expect(restoreAuthorizedWallet(choice)).resolves.toEqual({
      address: '0x1111111111111111111111111111111111111111',
      chainId: 61997,
    })
    expect(methods).toEqual(['eth_accounts', 'eth_chainId'])
  })

  it('does not restore when the wallet has no authorized account', async () => {
    const choice: WalletChoice = {
      id: 'okx',
      name: 'OKX Wallet',
      provider: { async request() { return [] } },
    }
    await expect(restoreAuthorizedWallet(choice)).resolves.toBeNull()
  })
})
