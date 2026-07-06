
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // O link do stream alvo
  const targetHost = '2606.cdn10embed.xyz'
  
  // Substitui a URL para apontar para o servidor de origem real
  // Exemplo: https://seu-worker.workers.dev/bandsports/index.m3u8 
  // vai buscar em https://2606.cdn10embed.xyz/bandsports/index.m3u8
  const targetUrl = request.url.replace(url.origin, 'https://' + targetHost)

  // Prepara os cabeçalhos para fingir que a requisição vem do site permitido
  const headers = new Headers(request.headers)
  headers.set('Referer', 'https://12embeddecanais.xyz/')
  headers.set('Origin', 'https://12embeddecanais.xyz/')
  headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

  // Remove cabeçalhos que possam identificar o seu Worker/Host
  headers.delete('Host')

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body
  })

  // Corrige os cabeçalhos de CORS na resposta para permitir que seu player no navegador leia o stream
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  newResponse.headers.set('Access-Control-Allow-Headers', '*')

  return newResponse
}
