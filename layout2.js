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
        const contentList = document.getElementById('contentList');
        if (contentList) contentList.innerHTML = `<div class="item" style="color:red; text-align:center;">Erro ao Ler a Lista de Canais</div>`;
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
        const isSpecial = ['fhd', 'ad'].includes(String(item.qualidade).toLowerCase());
        
        div.innerHTML = `
            <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
            ${isSpecial ? '<span class="ad-badge" style="background-color:red; color:white; padding:0 4px; border-radius:3px; margin-right:5px; font-size:10px; font-weight:bold;">AD</span>' : ''}
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
    
    const workerHD = "https://open.tvgratisonline12.workers.dev/?url=https://ww4.embedtv.lat/";
    const workerFHD = "https://redecanaistv.uk/player3/ch.php?canal=";
    const prefixo4k = "https://embedcanaisdetv.xyz/e/index.php?canal=";
    
    let urlVideo;
    const qual = String(c.qualidade).toLowerCase();

    // Lógica das URLs
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

    document.getElementById("player").innerHTML = `<iframe src="${urlVideo}" allowfullscreen allow="autoplay; fullscreen" style="width:100%;height:100%;border:none;"></iframe>`;

    const overlay = document.getElementById('iframe-overlay');
    // Apenas FHD e AD acionam o aviso de anúncio
    const isSpecial = ['fhd', 'ad'].includes(qual);

    if (overlay) {
        overlay.ondblclick = () => {
            const container = document.getElementById('player-container');
            if (container && !document.fullscreenElement) container.requestFullscreen();
            else if (document.fullscreenElement) document.exitFullscreen();
        };

        clearTimeout(overlayTimeout);
        overlay.style.setProperty('display', 'block', 'important');

        // Se for especial (FHD ou AD), exibe o aviso. Se for 4K ou outro, não exibe.
        if (isSpecial) {
            exibirAvisoBonito();
            setTimeout(() => {
                const aviso = document.getElementById('aviso-bonito');
                if (aviso) aviso.remove();
                overlay.style.setProperty('display', 'none', 'important');
                
                overlayTimeout = setTimeout(() => {
                    overlay.style.setProperty('display', 'block', 'important');
                }, 10000);
            }, 5000);
        } else {
            // Para 4K, escondemos o overlay logo após carregar (sem mostrar aviso)
            overlay.style.setProperty('display', 'none', 'important');
        }
    }
}

function exibirAvisoBonito() {
    const playerContainer = document.getElementById('player-container');
    const aviso = document.createElement('div');
    aviso.id = 'aviso-bonito';
    aviso.style.cssText = `
        position: absolute; top: 10%; left: 10%; width: 80%; height: 80%;
        background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
        color: #fff; display: flex; flex-direction: column; align-items: center;
        justify-content: center; z-index: 100; text-align: center;
        font-family: 'Segoe UI', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;
    aviso.innerHTML = `
        <div id="noise-container"><div id="tv-static"></div></div>
        <div id="welcome-screen">
            <div id="welcome-title">AVISO IMPORTANTE</div>
            <div id="welcome-sub" style="animation: fadeIn 1s forwards 0.5s">Este canal contém anúncios.<br>
            Caso uma nova janela abra, <b>feche-a imediatamente</b> <br> e retorne ao site para continuar assistindo.</div>
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
