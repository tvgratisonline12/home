let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;
let overlayTimeout;
let fadeTimeout;

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
        if (list) list.innerHTML = `<div class="item" style="color:red; text-align:center;">Erro ao Ler a Lista de Canais</div>`;
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
        div.ondblclick = () => {
            playCanal(item, div);
            setTimeout(() => {
                const c = document.getElementById('player-container');
                if (c && !document.fullscreenElement) c.requestFullscreen();
            }, 300);
        };
        l.appendChild(div);
    });
}

function playCanal(c, el) {
    let nc = document.getElementById('noise-container'); if (nc) nc.remove();
    let s = document.getElementById('tv-static'); if (s) s.remove();
    let w = document.getElementById('welcome-screen'); if (w) w.remove();
    
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
    } else if (qual === "sd") {
        urlVideo = c.logo + ".m3u8";
    } else {
        urlVideo = c.logo;
    }

    playerDiv.innerHTML = `<iframe id="main-iframe" src="${urlVideo}" allowfullscreen allow="autoplay; fullscreen" style="width:100%;height:100%;border:none;"></iframe>`;

    // Regra dos 10 segundos para 4K
    if (qual === "4k") {
        const blocker = document.createElement('div');
        blocker.id = 'blocker-4k';
        blocker.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; z-index:99; background:transparent; cursor:wait;";
        playerDiv.style.position = "relative";
        playerDiv.appendChild(blocker);

        setTimeout(() => {
            const b = document.getElementById('blocker-4k');
            if (b) b.remove();
        }, 10000);
    }

    const overlay = document.getElementById('iframe-overlay');
    if (overlay) {
        overlay.ondblclick = () => {
            const container = document.getElementById('player-container');
            if (container && !document.fullscreenElement) container.requestFullscreen();
            else if (document.fullscreenElement) document.exitFullscreen();
        };

        const isSpecial = ['fhd', 'ad'].includes(qual);
        clearTimeout(overlayTimeout);
        overlay.style.setProperty('display', 'block', 'important');

        if (isSpecial) {
            exibirAvisoBonito();
            setTimeout(() => {
                const aviso = document.getElementById('aviso-bonito');
                if (aviso) aviso.remove();
                overlay.style.setProperty('display', 'none', 'important');
                overlayTimeout = setTimeout(() => {
                    overlay.style.setProperty('display', 'block', 'important');
                }, 10000);
            }, 4000);
        }
    }
}

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

function exibirAvisoBonito() {
    const playerContainer = document.getElementById('player-container');
    const aviso = document.createElement('div');
    aviso.id = 'aviso-bonito';
    aviso.style.cssText = `
        position: absolute; top: 0%; left: 0%; width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; z-index: 100; text-align: center;
        font-family: 'Segoe UI', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;
    aviso.innerHTML = `
        <div id="noise-container"><div id="tv-static"></div></div>
        <div id="welcome-screen">
            <div id="welcome-title">Aviso Importante</div>
            <div id="welcome-sub" style="animation: fadeIn 1s forwards 0.5s">Este canal contém anúncios.<br>
            Caso uma nova janela abra, <b>feche-a</b> <br> e retorne ao site para continuar assistindo</div>
        </div>
    `;
    playerContainer.appendChild(aviso);
}

function clearPlayer() {
    const p = document.getElementById("player");
    if (p) p.innerHTML = "";
    const sb = document.getElementById("smart-buffer-overlay");
    if (sb) sb.style.display = "none";
}

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

window.onload = function() {
    carregarCanaisJSON();
    iniciarTelaInicial();
};
