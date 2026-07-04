let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;
let overlayTimeout;

// --- 1. CARREGAMENTO DO JSON ---
async function carregarCanaisJSON() {
    try {
        const response = await fetch('https://tvgratis.online/45s84e1free.json');
        if (!response.ok) throw new Error('Falha');
        canaisRaw = await response.json();
        
        const s = new Set(['Todos']);
        canaisRaw.forEach(c => { 
            if (c.categorias && Array.isArray(c.categorias)) {
                c.categorias.forEach(cat => s.add(cat));
            }
        });
        categorias = Array.from(s);
        renderList();
    } catch (error) {
        const contentList = document.getElementById('contentList');
        if (contentList) contentList.innerHTML = `<div class="item" style="color:red; text-align:center;">Erro ao Ler a Lista de Canais</div>`;
    }
}

// --- 2. RENDERIZAÇÃO DA LISTA ---
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
        
        const qual = String(item.qualidade).toLowerCase();
        let badgeHtml = '';
        if (['fhd', 'ad'].includes(qual)) {
            badgeHtml = '<span class="ad-badge" style="background-color:red; color:white; padding:0 4px; border-radius:3px; margin-right:5px; font-size:10px; font-weight:bold;">AD</span>';
        } else if (qual === '4k') {
            badgeHtml = '<span class="vip-badge" style="background-color:yellow; color:black; padding:0 4px; border-radius:3px; margin-right:5px; font-size:10px; font-weight:bold;">VIP</span>';
        }
        
        div.innerHTML = `<span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span> ${badgeHtml} <span>${item.canal || "Canal"}</span>`;
        
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

// --- 3. PLAYER E LÓGICA DE CANAIS ---
function playCanal(c, el) {
    const qual = String(c.qualidade).toLowerCase();
    
    // Aviso Automático
    const avisoAntigo = document.getElementById('aviso-bonito');
    if (avisoAntigo) avisoAntigo.remove();
    if (qual === 'ad' || qual === 'fhd') exibirAvisoBonito();
    
    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    clearPlayer();
    
    const workerHD = "https://open.tvgratisonline12.workers.dev/?url=https://ww4.embedtv.lat/";
    const workerFHD = "https://redecanaistv.uk/player3/ch.php?canal=";
    const prefixo4k = "https://embedcanaisdetv.xyz/e/index.php?canal=";
    
    let urlVideo = (qual === "4k") ? prefixo4k + c.logo : (qual === "fhd") ? workerFHD + c.logo : (qual === "hd") ? workerHD + encodeURIComponent(c.logo) : (qual === "sd") ? c.logo + ".m3u8" : c.logo;

    const playerDiv = document.getElementById("player");
    const iframe = document.createElement('iframe');
    iframe.src = urlVideo;
    iframe.id = "canalIframe";
    iframe.style.cssText = "width:100%;height:100%;border:none;pointer-events:auto;";
    iframe.allow = "autoplay; fullscreen";
    iframe.allowFullscreen = true;

    // Injeção de CSS para 4K
    if (qual === "4k") {
        iframe.onload = function() {
            try {
                const css = `<style>.vip-modal-overlay, .vip-modal-content, #vipModal, .modal-backdrop, .popup-container { display: none !important; }</style>`;
                iframe.contentDocument.head.insertAdjacentHTML('beforeend', css);
            } catch (e) { console.warn("Injeção bloqueada (CORS/CSP)."); }
        };
    }
    playerDiv.appendChild(iframe);

    // Lógica de Bloqueio de Overlay
    const overlay = document.getElementById('iframe-overlay');
    if (overlay) {
        clearTimeout(overlayTimeout);
        if (['fhd', 'ad', '4k'].includes(qual)) {
            overlay.style.setProperty('display', 'none', 'important');
            overlayTimeout = setTimeout(() => overlay.style.setProperty('display', 'block', 'important'), 10000);
        } else if (['hd', 'sd'].includes(qual)) {
            overlay.style.setProperty('display', 'block', 'important');
        } else {
            overlay.style.setProperty('display', 'none', 'important');
        }
    }
}

// --- 4. FUNÇÕES DE SUPORTE ---
function clearPlayer() {
    const p = document.getElementById("player");
    if (p) p.innerHTML = "";
    const sb = document.getElementById("smart-buffer-overlay");
    if (sb) sb.style.display = "none";
}

function iniciarTelaInicial() {
    const p = document.getElementById('player');
    if (!p) return;
    p.innerHTML = `<div id="noise-container"><div id="tv-static"></div></div><div id="welcome-screen"><div id="welcome-title">TVGrátis.Online</div><div id="welcome-sub" style="animation: fadeIn 1s forwards 0.5s">Escolha um canal para começar</div></div>`;
}

function exibirAvisoBonito() {
    const playerContainer = document.getElementById('player-container');
    const aviso = document.createElement('div');
    aviso.id = 'aviso-bonito';
    aviso.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; text-align: center; font-family: 'Segoe UI', sans-serif; padding: 20px; box-sizing: border-box;`;
    aviso.innerHTML = `<div id="welcome-screen"><div id="welcome-title" style="font-size: 28px; font-weight: bold; margin-bottom: 15px; color: #ffcc00;">AVISO IMPORTANTE</div><div id="welcome-sub" style="font-size: 18px; line-height: 1.5; color: #ffffff;">Este canal contém anúncios.<br>Caso uma nova janela abra, <b>feche-a imediatamente</b><br>e retorne ao site para continuar assistindo.</div></div>`;
    playerContainer.appendChild(aviso);
    setTimeout(() => { if (aviso) aviso.remove(); }, 4000);
}

// --- 5. NAVEGAÇÃO CATEGORIAS ---
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
