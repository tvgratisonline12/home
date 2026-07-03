let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;

// --- FUNÇÕES DE CARREGAMENTO E RENDERIZAÇÃO ---

async function carregarCanaisJSON() {
    try {
        const response = await fetch('https://tvgratis.online/45s84e1free.json');
        if (!response.ok) throw new Error('Falha');
        canaisRaw = await response.json();
        
        const s = new Set(['Todos']);
        canaisRaw.forEach(c => { 
            (c.categorias || []).forEach(x => { if (x !== "Todos") s.add(x); }); 
        });
        categorias = [...s];
        renderList();
    } catch (error) {
        const list = document.getElementById('contentList');
        if (list) list.innerHTML = `<div class="item" style="color:red; text-align:center;">Erro ao ler canais</div>`;
    }
}

function renderList() {
    const catDisplay = document.getElementById("categoriaAtual");
    if (catDisplay) catDisplay.innerText = categoriaAtual;
    const l = document.getElementById('contentList');
    if (!l) return;
    l.innerHTML = '';
    
    const lista = canaisRaw.filter(c => categoriaAtual === "Todos" || (c.categorias || []).includes(categoriaAtual));
    
    lista.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'item';
        const isSpecial = ['fhd', 'ad', '4k'].includes(String(item.qualidade).toLowerCase());
        
        div.innerHTML = `
            <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
            ${isSpecial ? `<span class="ad-badge" style="background-color:${item.qualidade === '4k' ? 'gold' : 'red'}; color:black; padding:0 4px; border-radius:3px; margin-right:5px; font-size:10px; font-weight:bold;">${item.qualidade.toUpperCase()}</span>` : ''}
            <span>${item.canal || "Canal"}</span>
        `;
        div.onclick = () => playCanal(item, div);
        l.appendChild(div);
    });
}

// --- PLAYER E LÓGICA DE CANAIS ---

function playCanal(c, el) {
    // Remove elementos da tela inicial
    const nc = document.getElementById('noise-container'); if (nc) nc.remove();
    const s = document.getElementById('tv-static'); if (s) s.remove();
    const w = document.getElementById('welcome-screen'); if (w) w.remove();
    
    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    
    clearPlayer();
    
    const playerDiv = document.getElementById("player");
    const workerHD = "https://open.tvgratisonline12.workers.dev/?url=https://ww4.embedtv.lat/";
    const workerFHD = "https://redecanaistv.uk/player3/ch.php?canal=";
    const prefixo4k = "https://embedcanaisdetv.xyz/e/index.php?canal=";
    
    let urlVideo;
    const qual = String(c.qualidade).toLowerCase();

    if (qual === "4k") {
        urlVideo = prefixo4k + c.logo;
    } else if (qual === "fhd") {
        urlVideo = workerFHD + c.logo;
    } else if (qual === "hd") {
        urlVideo = workerHD + encodeURIComponent(c.logo);
    } else {
        urlVideo = c.logo;
    }

    playerDiv.innerHTML = `<iframe id="main-iframe" src="${urlVideo}" allowfullscreen allow="autoplay; fullscreen" style="width:100%;height:100%;border:none;"></iframe>`;
}

function clearPlayer() {
    const p = document.getElementById("player");
    if (p) p.innerHTML = "";
}

// --- EFEITOS DE TELA INICIAL ---

function iniciarTelaInicial() {
    const p = document.getElementById('player');
    if (!p) return;
    p.innerHTML = `
        <div id="noise-container"><div id="tv-static"></div></div>
        <div id="welcome-screen">
            <div id="welcome-title">TVGrátis.Online</div>
            <div id="welcome-sub" style="animation: fadeIn 1s forwards 0.5s">Escolha um canal para começar</div>
        </div>
    `;
}

// --- CATEGORIAS ---

function proximaCategoria() {
    if (categorias.length === 0) return;
    indiceCategoria = (indiceCategoria + 1) % categorias.length;
    categoriaAtual = categorias[indiceCategoria];
    renderList();
}

function categoriaAnterior() {
    if (categorias.length === 0) return;
    indiceCategoria = (indiceCategoria - 1 + categorias.length) % categorias.length;
    categoriaAtual = categorias[indiceCategoria];
    renderList();
}

window.onload = function() {
    carregarCanaisJSON();
    iniciarTelaInicial();
};
