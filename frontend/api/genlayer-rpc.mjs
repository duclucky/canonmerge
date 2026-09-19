const UPSTREAM = 'https://studio-dev.genlayer.com/api'
export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({error:'Method not allowed'})
  const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body)
  if (body.length > 200000) return response.status(413).json({error:'RPC request too large'})
  try { const upstream=await fetch(UPSTREAM,{method:'POST',headers:{'content-type':'application/json'},body}); const text=await upstream.text(); response.status(upstream.status).setHeader('content-type','application/json').send(text) }
  catch { response.status(502).json({error:'GenLayer RPC unavailable'}) }
}
