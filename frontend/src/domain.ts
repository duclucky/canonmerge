export type WorldStatus = 'OPEN' | 'READY' | 'REVIEWING' | 'RETRYABLE' | 'MERGED' | 'FORKED' | 'REFUNDABLE' | 'CLOSED'

export interface Branch {
  slot: 'A' | 'B'
  author: string
  text: string
  submittedAt: number
}

export interface CanonNode {
  id: string
  parentId: string | null
  label: string
  text: string
  author: string | null
  canExtend: string[]
}

export interface WorldSummary {
  id: string
  title: string
  status: WorldStatus
  sponsor: string
  writerA: string
  writerB: string
  createdAt: number
  submitDeadline: number
  reviewDeadline: number
}

export interface WorldDetail extends WorldSummary {
  canon: string
  rules: string
  parentNodeId: string
  branchA: Branch | null
  branchB: Branch | null
  nodes: CanonNode[]
  result: 'MERGEABLE' | 'CONFLICTING' | null
  retryReason: string | null
  lastTransaction: string | null
}

export interface AccountOverview {
  worlds: WorldSummary[]
  creditGen: string
}

export type TransactionStage = 'idle' | 'submitted' | 'accepted' | 'finalized' | 'failed' | 'retryable'

export interface TransactionProgress {
  stage: TransactionStage
  hash?: string
  message?: string
}

export interface CreateWorldInput {
  title: string
  canon: string
  rules: string
  writerA: string
  writerB: string
  submitDeadline: number
  reviewDeadline: number
}

export interface SubmitBranchInput {
  worldId: string
  slot: 'A' | 'B'
  text: string
}

export function shortAddress(address: string): string {
  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}

export function formatDate(seconds: number): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(seconds * 1000)
}

export function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function statusLabel(status: WorldStatus): string {
  const labels: Record<WorldStatus, string> = {
    OPEN: 'Waiting for scenes',
    READY: 'Ready to compare',
    REVIEWING: 'Under review',
    RETRYABLE: 'Review needs another try',
    MERGED: 'One shared canon',
    FORKED: 'Two story paths',
    REFUNDABLE: 'Ready for recovery',
    CLOSED: 'Round closed',
  }
  return labels[status]
}
