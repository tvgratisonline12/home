let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;
let overlayTimeout;

async function carregarCanaisJSON() {
    try {
        const response = await fetch('https://tvgratis.online/45s84e1free.json');
        if (!response.ok) throw new Error('Falha');
        canaisRaw = await response.json();
        const s = new Set(['Todos']);
        canaisRaw.forEach(c => { (c.categorias || []).forEach(x => { if (x != "Todos") s.add(x); }); });
        categorias = [...s];
        renderList();
    } catch (error) {
        const list = document.getElementById('contentList');
        if (list) list.innerHTML = `<div class="item" style="color:red; text-align:center;">Erro ao Ler Lista</div>`;
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

function playCanal(c, el) {
    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    
    clearPlayer();
    
    const playerDiv = document.getElementById("player");
    const workerHD = "https://open.tvgratisonline12.workers.dev/?url=https://ww4.embedtv.lat/";
    const workerFHD = "https://redecanaistv.uk/player3/ch.php?canal=";
    const prefixo4k = "https://embedcanaisdetv.xyz/e/index.php?canal=";
    
    let urlVideo;
    const qual = String(c.qualidade).toLowerCase();

    // Lógica de URL
    if (qual === "4k") {
        urlVideo = prefixo4k + c.logo;
    } else if (qual === "fhd") {
        urlVideo = workerFHD + c.logo;
    } else if (qual === "hd") {
        urlVideo = workerHD + encodeURIComponent(c.logo);
    } else {
        urlVideo = c.logo;
    }

    // Montagem do Iframe com injeção de CSS para ocultar anúncios/modais
    // O CSS tenta injetar via string no estilo se possível, ou usamos overlay
    playerDiv.innerHTML = `<iframe id="main-iframe" src="${urlVideo}" allowfullscreen allow="autoplay; fullscreen" style="width:100%;height:100%;border:none;"></iframe>`;

    // Regra 4K: Bloqueia interação após 10 segundos
    if (qual === "4k") {
        playerDiv.style.position = "relative";
        setTimeout(() => {
            if (!document.getElementById('blocker-4k')) {
                const blocker = document.createElement('div');
                blocker.id = 'blocker-4k';
                blocker.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; z-index:9999; background:transparent; cursor:not-allowed;";
                playerDiv.appendChild(blocker);
            }
        }, 10000);
    }
}

function clearPlayer() {
    const p = document.getElementById("player");
    if (p) p.innerHTML = "";
}

window.onload = function() {
    carregarCanaisJSON();
};
