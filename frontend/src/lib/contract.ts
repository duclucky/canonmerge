import { CALL_KEY_UNNAMED, createClient, encodeExternalMessageFeeParams, isSuccessful, MessageType } from 'genlayer-js'
import { studioDevnet } from 'genlayer-js/chains'
import { isAddress, type Address } from 'viem'
import type { AccountOverview, CreateWorldInput, SubmitBranchInput, TransactionProgress, WorldDetail, WorldStatus, WorldSummary } from '../domain'
import { ensureStudioNetwork, getActiveWalletSession } from './wallet'

export interface CanonGateway {
  listWorlds(): Promise<WorldSummary[]>
  getWorld(id: string): Promise<WorldDetail>
  getAccount(address: string): Promise<AccountOverview>
  createWorld(input: CreateWorldInput, account: string, onProgress: (progress: TransactionProgress) => void): Promise<string>
  submitBranch(input: SubmitBranchInput, account: string, onProgress: (progress: TransactionProgress) => void): Promise<void>
  reviewWorld(id: string, account: string, onProgress: (progress: TransactionProgress) => void): Promise<void>
  recoverWorld(id: string, account: string, onProgress: (progress: TransactionProgress) => void): Promise<void>
  withdraw(account: string, onProgress: (progress: TransactionProgress) => void): Promise<void>
}

const GEN = 10n ** 18n
const BUDGET = 2n * GEN
export const contractAddress = String(import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS ?? import.meta.env.VITE_CONTRACT_ADDRESS ?? '').trim()
export const contractConfigured = isAddress(contractAddress)
const endpoint = String(import.meta.env.VITE_GENLAYER_IC_RPC_URL ?? '/genlayer-rpc').trim()
export type AdapterRuntime = {
  contractAddress?: string
  endpoint?: string
  sessionGetter?: typeof getActiveWalletSession
  clientFactory?: typeof createClient
}

export class ContractUnavailableError extends Error {
  constructor() { super('CanonMerge is not connected to a deployed contract yet.'); this.name = 'ContractUnavailableError' }
}

function parseJson(value: unknown): Record<string, unknown> {
  if (typeof value !== 'string') throw new Error('The contract returned a non-JSON view.')
  const parsed = JSON.parse(value) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('The contract returned invalid JSON.')
  return parsed as Record<string, unknown>
}
const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const number = (value: unknown) => Number(value ?? 0)
export function baseUnitsToGen(value: unknown): string {
  const raw = BigInt(String(value ?? '0')); const whole = raw / GEN; const fraction = (raw % GEN).toString().padStart(18, '0').slice(0, 4).replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole.toString()
}
function mapStatus(phase: string): WorldStatus {
  return ({ OPEN:'OPEN', READY:'READY', RETRYABLE:'RETRYABLE', MERGED:'MERGED', FORKED:'FORKED', CLOSED:'CLOSED' } as Record<string,WorldStatus>)[phase] ?? 'OPEN'
}
function toSummary(item: Record<string, unknown>): WorldSummary {
  return { id:text(item.world_id), title:text(item.title), status:mapStatus(text(item.phase)), sponsor:text(item.sponsor), writerA:text(item.writer_a), writerB:text(item.writer_b), createdAt:number(item.created_at), submitDeadline:number(item.submit_deadline), reviewDeadline:number(item.review_deadline) }
}
function toWorld(item: Record<string, unknown>): WorldDetail {
  const summary=toSummary(item); const nodes=[] as WorldDetail['nodes']; const branchA=text(item.branch_a); const branchB=text(item.branch_b)
  return { ...summary, canon:text(item.canon), rules:text(item.rules), parentNodeId:text(item.parent_node_id), branchA:branchA?{slot:'A',author:summary.writerA,text:branchA,submittedAt:number(item.branch_a_at)}:null, branchB:branchB?{slot:'B',author:summary.writerB,text:branchB,submittedAt:number(item.branch_b_at)}:null, nodes, result:(text(item.result)==='MERGEABLE'||text(item.result)==='CONFLICTING')?text(item.result) as 'MERGEABLE'|'CONFLICTING':null, retryReason:null, lastTransaction:null }
}
function failed(receipt: unknown): boolean {
  if (!receipt || typeof receipt !== 'object') return true
  const serialized=JSON.stringify(receipt).toUpperCase()
  return serialized.includes('EXECUTION_ERROR') || serialized.includes('EXECUTION_FAILURE') || serialized.includes('REVERTED')
}
function slug(title: string): string {
  const base=title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,42) || 'world'
  return `${base}-${Date.now().toString(36)}`.slice(0,64)
}
export async function writeWithRuntime(method:string,args:Array<string|number>,value:bigint,onProgress:(p:TransactionProgress)=>void,runtime:AdapterRuntime={}):Promise<string>{
  const resolvedAddress=runtime.contractAddress ?? contractAddress
  const resolvedEndpoint=runtime.endpoint ?? endpoint
  if(!isAddress(resolvedAddress)) throw new ContractUnavailableError()
  const session=(runtime.sessionGetter ?? getActiveWalletSession)(); if(!session || !isAddress(session.account)) throw new Error('Choose and connect an EVM wallet before writing.')
  try {
    await ensureStudioNetwork(session.provider)
    const client=(runtime.clientFactory ?? createClient)({chain:studioDevnet,endpoint:resolvedEndpoint,account:session.account as Address,provider:session.provider})
    const allocations=method==='withdraw_credit'?[{messageType:MessageType.External,recipient:session.account as Address,callKey:CALL_KEY_UNNAMED,budget:42000n,feeParams:encodeExternalMessageFeeParams({gasLimit:21000n,maxGasPrice:2n})}]:undefined
    const quote=await client.estimateTransactionFeesForWrite({address:resolvedAddress as Address,functionName:method,args,value,...(allocations?{messageAllocations:allocations}:{})})
    const hash=await client.writeContract({address:resolvedAddress as Address,functionName:method,args,value,fees:{distribution:quote.distribution,feeValue:quote.feeValue,...(quote.messageAllocations?.length?{messageAllocations:quote.messageAllocations}:{})}})
    onProgress({stage:'submitted',hash:String(hash),message:'Transaction submitted; waiting for a validator decision.'})
    const accepted=await client.waitForTransactionReceipt({hash,waitUntil:'decided',interval:1500,retries:40})
    if(failed(accepted)||!isSuccessful(accepted)) throw new Error('The accepted transaction contains an execution error.')
    onProgress({stage:'accepted',hash:String(hash),message:'Decision accepted; waiting for finality.'})
    const finalized=await client.waitForTransactionReceipt({hash,waitUntil:'finalized',interval:2500,retries:120})
    if(failed(finalized)||!isSuccessful(finalized)) throw new Error('The finalized transaction did not execute successfully.')
    onProgress({stage:'finalized',hash:String(hash),message:'Finalized. Reloading canonical contract state.'}); return String(hash)
  } catch(cause) { const message=cause instanceof Error?cause.message:'Transaction failed.'; onProgress({stage:'failed',message}); throw cause }
}
function reader(){ if(!contractConfigured) throw new ContractUnavailableError(); return createClient({chain:studioDevnet,endpoint}) }
async function read(method:string,args:Array<string|number> = []) { return reader().readContract({address:contractAddress as Address,functionName:method,args}) }
async function readWorld(id:string):Promise<WorldDetail>{
  const world=toWorld(parseJson(await read('get_world',[id])))
  const nodeIds=[world.parentNodeId]
  if(world.result==='MERGEABLE') nodeIds.push(`${id}:MERGED`)
  if(world.result==='CONFLICTING') nodeIds.push(`${id}:FORK:A`,`${id}:FORK:B`)
  for(const nodeId of nodeIds){
    const item=parseJson(await read('get_node',[nodeId])); const canExtend:string[]=[]
    if(nodeId!==world.parentNodeId){ for(const actor of [world.writerA,world.writerB]) if(await read('can_extend',[nodeId,actor])===true) canExtend.push(actor) }
    world.nodes.push({id:text(item.node_id),parentId:text(item.parent_id)||null,label:text(item.kind),text:text(item.text),author:text(item.author)||null,canExtend})
  }
  return world
}
async function ids():Promise<string[]>{ const c=Number(await read('get_world_count')); const out=[] as string[]; for(let i=0;i<Math.min(c,200);i++) out.push(String(await read('get_world_id',[i]))); return out }

export const gateway: CanonGateway = {
  async listWorlds(){ const out=[] as WorldSummary[]; for(const id of await ids()) out.push(toSummary(parseJson(await read('get_world',[id])))); return out.reverse() },
  getWorld:readWorld,
  async getAccount(address){ const worlds=(await this.listWorlds()).filter(w=>[w.sponsor,w.writerA,w.writerB].some(a=>a.toLowerCase()===address.toLowerCase())); const credit=parseJson(await read('get_credit',[address])); return {worlds,creditGen:baseUnitsToGen(credit.amount)} },
  async createWorld(input,_account,onProgress){ const id=slug(input.title); await writeWithRuntime('create_world',[id,input.title,input.canon,input.rules,input.writerA,input.writerB,input.submitDeadline,input.reviewDeadline],BUDGET,onProgress); await readWorld(id); return id },
  async submitBranch(input,_account,onProgress){ await writeWithRuntime('submit_branch',[input.worldId,input.slot,input.text],0n,onProgress); await readWorld(input.worldId) },
  async reviewWorld(id,_account,onProgress){ await writeWithRuntime('review_merge',[id],0n,onProgress); await readWorld(id) },
  async recoverWorld(id,_account,onProgress){ const world=await readWorld(id); const method=(world.branchA&&world.branchB)?'recover_unresolved':'cancel_missing'; await writeWithRuntime(method,[id],0n,onProgress); await readWorld(id) },
  async withdraw(account,onProgress){ await writeWithRuntime('withdraw_credit',[],0n,onProgress); await read('get_credit',[account]) },
}

