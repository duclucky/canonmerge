import { afterEach, describe, expect, it, vi } from 'vitest'
import { createClient } from 'genlayer-js'
import { studioDevnet } from 'genlayer-js/chains'
import { writeWithRuntime } from './contract'

const sender='0x1111111111111111111111111111111111111111' as const
const contract='0x2222222222222222222222222222222222222222' as const
const hash=`0x${'55'.repeat(32)}` as const

type Request={method:string;params?:unknown[]|Record<string,unknown>}
function provider(requests:Request[]){ return { async request(request:Request){
  // Real browser wallets serialize EIP-1193 payloads before forwarding them.
  // Keep the wallet boundary honest while the BigInt receipt fixture covers the observed failure.
  const serialized=JSON.stringify(request)
  requests.push(JSON.parse(serialized) as Request)
  if(request.method==='wallet_switchEthereumChain')return null
  if(request.method==='eth_chainId')return `0x${studioDevnet.id.toString(16)}`
  if(request.method==='eth_sendTransaction')return hash
  throw new Error(`Unexpected ${request.method}`)
} } }
function stubRpc(){ vi.stubGlobal('fetch',async(_input:RequestInfo|URL,init?:RequestInit)=>{ const body=JSON.parse(String(init?.body??'{}')) as {method:string,id:number}; const values:Record<string,string>={eth_getTransactionCount:'0x0',eth_estimateGas:'0x30d40',eth_gasPrice:'0x0',eth_blockNumber:'0x1'}; if(body.method==='eth_getTransactionReceipt') return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result:{transactionHash:hash,transactionIndex:'0x0',blockHash:`0x${'aa'.repeat(32)}`,blockNumber:'0x1',from:sender,to:contract,cumulativeGasUsed:'0x0',gasUsed:'0x0',contractAddress:null,logs:[],logsBloom:`0x${'00'.repeat(256)}`,status:'0x1',effectiveGasPrice:'0x0',type:'0x0'}})); if(!values[body.method])throw new Error(`Unexpected RPC ${body.method}`); return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result:values[body.method]})) }) }
function factory(fees:Array<Record<string,unknown>>=[]){ const make:typeof createClient=(config)=>{ const client=createClient({...config,chain:{...studioDevnet,rpcUrls:{default:{http:['https://offline.invalid']}}}}); client.estimateTransactionFeesForWrite=(async(request:unknown)=>{fees.push(request as Record<string,unknown>); return {distribution:{leaderTimeunitsAllocation:0n,validatorTimeunitsAllocation:0n,appealRounds:0n,executionBudgetPerRound:0n,maxPriceGenPerTimeUnit:0n,storageFeeMaxGasPrice:0n,receiptFeeMaxGasPrice:0n},feeValue:0n,policy:{enabled:false}}}) as typeof client.estimateTransactionFeesForWrite; client.waitForTransactionReceipt=(async()=>({statusName:'ACCEPTED',txExecutionResultName:'FINISHED_WITH_RETURN',gasUsed:1n})) as unknown as typeof client.waitForTransactionReceipt; return client }; return make }
afterEach(()=>vi.unstubAllGlobals())

describe('CanonMerge real SDK wallet preflight',()=>{
  it('encodes creation from the configured selected account with exactly 2 GEN',async()=>{ const requests:Request[]=[]; stubRpc(); const phases:string[]=[]; await writeWithRuntime('create_world',['w','T','C','R','0x3333333333333333333333333333333333333333','0x4444444444444444444444444444444444444444',1900003600,1900007200],2n*10n**18n,p=>phases.push(p.stage),{contractAddress:contract,endpoint:'https://offline.invalid',clientFactory:factory(),sessionGetter:()=>({account:sender,provider:provider(requests)})}); const send=requests.find(r=>r.method==='eth_sendTransaction'); const tx=(send?.params as unknown[])[0] as Record<string,string>; expect(tx.from.toLowerCase()).toBe(sender); expect(BigInt(tx.value)).toBe(2n*10n**18n); expect(phases).toEqual(['submitted','accepted','finalized']) })
  it('allocates the external transfer budget before withdrawal',async()=>{ const requests:Request[]=[]; const fees:Array<Record<string,unknown>>=[]; stubRpc(); await writeWithRuntime('withdraw_credit',[],0n,()=>undefined,{contractAddress:contract,endpoint:'https://offline.invalid',clientFactory:factory(fees),sessionGetter:()=>({account:sender,provider:provider(requests)})}); expect(fees[0].messageAllocations).toMatchObject([{recipient:sender,budget:42000n}]) })
})


