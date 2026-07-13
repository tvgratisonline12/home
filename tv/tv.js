// --- VARIÁVEIS GLOBAIS ---
let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;
let indiceSelecao = 0;
let focoAtual = 'categoria'; // 'categoria', 'lista', ou 'player'
let playerInstance = null;
let overlayTimeout;

// --- 1. CARREGAMENTO JSON ---
async function carregarCanaisJSON() {
    const urls = ['../jsons/rd.json', '../jsons/eb.json', '../jsons/cx.json', '../jsons/ec.json', '../jsons/pl.json'];
    try {
        const resultados = await Promise.allSettled(urls.map(url => fetch(url)));
        canaisRaw = resultados
            .filter(res => res.status === 'fulfilled' && res.value.ok)
            .map(res => res.value.json())
            .flat();

        const s = new Set(['Todos']);
        canaisRaw.forEach(c => (c.categorias || []).forEach(cat => s.add(cat)));
        categorias = Array.from(s);
        
        renderList();
    } catch (e) { console.error("Erro ao carregar:", e); }
}

// --- 2. RENDERIZAÇÃO ---
function renderList() {
    const l = document.getElementById('contentList');
    const catDisplay = document.getElementById("categoriaAtual");
    if (catDisplay) catDisplay.innerText = categoriaAtual;
    if (!l) return;
    l.innerHTML = '';
    
    const lista = canaisRaw.filter(c => categoriaAtual === "Todos" || (c.categorias || []).includes(categoriaAtual));
    
    lista.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `<span>${(idx + 1).toString().padStart(2, '0')} - ${item.canal}</span>`;
        div.onclick = () => playCanal(item, div);
        l.appendChild(div);
    });
}
focoIndex = -1; 
    const listaItens = document.querySelectorAll('#contentList .item');
    if (listaItens.length > 0) {
        focoIndex = 0;
        listaItens[0].classList.add('focused');
    }

// --- 3. LÓGICA DO PLAYER (Mantendo suas regras) ---
async function playCanal(c, el) {
    const qual = String(c.qualidade || "").toLowerCase();
    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');

    if (playerInstance) { playerInstance.dispose(); playerInstance = null; }
    const container = document.getElementById("player");
    
    let urlVideo = qual === "rd" ? "https://redecanaistv.uk/player3/ch.php?canal=" + c.logo :
                   qual === "ec" ? "https://open.tvgratis.workers.dev/" + encodeURIComponent(c.logo) + "/index.m3u8" :
                   qual === "eb" ? "https://open.tvgratis.workers.dev/?url=https://ww4.embedtv.lat/" + encodeURIComponent(c.logo) :
                   qual === "sd" ? c.logo + ".m3u8" :
                   qual === "pl" ? "https://jmp2.uk/plu-" + encodeURIComponent(c.logo) + ".m3u8" : c.logo;

    if (qual === 'pl') {
        container.innerHTML = `<div id="aviso-pl">Aviso: Canal precisa de link externo. <button onclick="window.open('${urlVideo}')">ABRIR</button></div>`;
    } else if (['sd', 'ec'].includes(qual)) {
        container.innerHTML = `<video id="video-player" class="video-js" controls autoplay playsinline></video>`;
        playerInstance = videojs('video-player', { autoplay: true, sources: [{ src: urlVideo, type: 'application/x-mpegURL' }] });
    } else {
        container.innerHTML = `<iframe id="videoIframe" src="${urlVideo}" allow="autoplay; fullscreen"></iframe>`;
    }
    
    focoAtual = 'player';
}

// --- 4. CONTROLE DPAD ---
document.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) e.preventDefault();

    switch(e.key) {
        case 'ArrowUp': 
            if(focoAtual === 'lista' && indiceSelecao > 0) { indiceSelecao--; atualizarFoco(); }
            else if(focoAtual === 'lista') { focoAtual = 'categoria'; atualizarFoco(); }
            break;
        case 'ArrowDown':
            if(focoAtual === 'categoria') { focoAtual = 'lista'; indiceSelecao = 0; atualizarFoco(); }
            else if(focoAtual === 'lista' && indiceSelecao < document.querySelectorAll('.item').length - 1) { indiceSelecao++; atualizarFoco(); }
            break;
        case 'ArrowRight':
            if(focoAtual === 'categoria') { indiceCategoria = (indiceCategoria + 1) % categorias.length; categoriaAtual = categorias[indiceCategoria]; renderList(); }
            else if(focoAtual === 'lista') { focoAtual = 'player'; }
            break;
        case 'ArrowLeft':
            if(focoAtual === 'categoria') { indiceCategoria = (indiceCategoria - 1 + categorias.length) % categorias.length; categoriaAtual = categorias[indiceCategoria]; renderList(); }
            else if(focoAtual === 'player') { focoAtual = 'lista'; atualizarFoco(); }
            break;
        case 'Enter':
            if(focoAtual === 'lista') document.querySelectorAll('.item')[indiceSelecao].click();
            break;
    }
});

function atualizarFoco() {
    document.querySelectorAll('.item, #categoriaAtual').forEach(el => el.classList.remove('focus'));
    if (focoAtual === 'lista') {
        const itens = document.querySelectorAll('.item');
        itens[indiceSelecao]?.classList.add('focus');
        itens[indiceSelecao]?.scrollIntoView({ block: 'center' });
    } else if (focoAtual === 'categoria') {
        document.getElementById('categoriaAtual')?.classList.add('focus');
    }
}

window.onload = () => { carregarCanaisJSON(); atualizarFoco(); };
