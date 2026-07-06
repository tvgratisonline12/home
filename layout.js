let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;
let overlayTimeout;

// --- 1. CARREGAMENTO DO JSON ---
async function carregarCanaisJSON() {
    try {
        const urls = [
            'rd.json',
            'eb.json',
            'cx.json',
             'ec.json'
     
        ];

        const resultados = await Promise.allSettled(urls.map(url => fetch(url)));

        const dadosValidos = [];
        for (const res of resultados) {
            if (res.status === 'fulfilled' && res.value.ok) {
                try {
                    const json = await res.value.json();
                    dadosValidos.push(json);
                } catch (e) {
                    console.warn("Erro ao processar JSON de uma fonte:", e);
                }
            }
        }

        if (dadosValidos.length === 0) {
            throw new Error("Nenhuma fonte de canais está disponível.");
        }

        canaisRaw = dadosValidos.flat();
        canaisRaw.sort((a, b) => (a.canal || "").localeCompare(b.canal || ""));

        const s = new Set(['Todos']);
        canaisRaw.forEach(c => { 
            if (c.categorias && Array.isArray(c.categorias)) {
                c.categorias.forEach(cat => s.add(cat));
            }
        });
        categorias = Array.from(s);
        
        renderList();
    } catch (error) {
        console.error("Erro crítico:", error);
        const contentList = document.getElementById('contentList');
        if (contentList) contentList.innerHTML = `<div class="item" style="color:red; text-align:center;">Nenhum canal disponível no momento.</div>`;
    }
}

// --- 2. RENDERIZAÇÃO DA LISTA ---
function renderList() {
    const catDisplay = document.getElementById("categoriaAtual");
    if (catDisplay) catDisplay.innerText = categoriaAtual;
    
    const l = document.getElementById('contentList');
    if (!l) return;

    const inputBusca = document.getElementById('filter');
    const termo = inputBusca ? inputBusca.value.toLowerCase() : "";
    
    l.innerHTML = '';
    
    const lista = canaisRaw.filter(c => {
        const matchCategoria = categoriaAtual === "Todos" || (c.categorias || []).includes(categoriaAtual);
        const matchBusca = (c.canal || "").toLowerCase().includes(termo);
        return matchCategoria && matchBusca;
    });
    
    lista.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'item';
        
        const qual = String(item.qualidade || "").toLowerCase();
        let badgeHtml = '';
        if (['rd', 'ad'].includes(qual)) {
            badgeHtml = '<span class="ad-badge" style="background-color:red; color:white; padding:0 4px; border-radius:3px; margin-left:5px; font-size:10px; font-weight:bold;">AD</span>';
        }
        
        div.innerHTML = `
            <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
            <span>${item.canal || "Canal"}</span>
            ${badgeHtml}
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

// --- 3. PLAYER ---
function playCanal(c, el) {
    const qual = String(c.qualidade).toLowerCase();
    
    let nc = document.getElementById('noise-container'); if (nc) nc.remove();
    let s = document.getElementById('tv-static'); if (s) s.remove();
    let w = document.getElementById('welcome-screen'); if (w) w.remove();
    
    const avisoAntigo = document.getElementById('aviso-bonito');
    if (avisoAntigo) avisoAntigo.remove();
    if (qual === 'ad' || qual === 'rd') {
        exibirAvisoBonito();
    }
    
    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    clearPlayer();
    
    const workerEC = "https://open.tvgratis.workers.dev/";
    const workerRD = "https://redecanaistv.uk/player3/ch.php?canal=";
    
    let urlVideo;
    if (qual === "rd") {
        urlVideo = workerRD + c.logo;
    } else if (qual === "ec") {
    urlVideo = workerEC + encodeURIComponent(c.logo) + "/index.m3u8";
    } else if (qual === "sd") {
        urlVideo = c.logo + ".m3u8";
    } else {
        urlVideo = c.logo;
    }

    document.getElementById("player").innerHTML = `<iframe id="videoIframe" src="${urlVideo}" allow="autoplay; fullscreen" style="width:100%;height:100%;border:none;pointer-events:auto;"></iframe>`;

    const overlay = document.getElementById('iframe-overlay');
    const isDelayedLock = ['rd', 'ad'].includes(qual); 
    const isImmediateLock = ['ec', 'sd'].includes(qual);

    if (overlay) {
        overlay.ondblclick = () => {
            const container = document.getElementById('player-container');
            if (container && !document.fullscreenElement) container.requestFullscreen();
            else if (document.fullscreenElement) document.exitFullscreen();
        };

        clearTimeout(overlayTimeout);
        if (isDelayedLock) {
            overlay.style.setProperty('display', 'none', 'important');
            overlayTimeout = setTimeout(() => {
                overlay.style.setProperty('display', 'block', 'important');
            }, 15000);
        } else if (isImmediateLock) {
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
}

function iniciarTelaInicial() {
    const p = document.getElementById('player');
    if (!p) return;

    p.innerHTML = `
        <div id="noise-container"><div id="tv-static"></div></div>
        <div id="welcome-screen">
            <div id="container-alternante">
                
                <div class="bloco-slide" id="slide-1">
                    <div id="welcome-title">TVGrátis.Online</div>
                    <div id="welcome-sub" style="animation: fadeIn 1s forwards 0.5s">Escolha um canal para começar</div>
                </div>

                <div class="bloco-slide" id="slide-2">
                    <div id="welcome-title" style="font-size: 1.8rem;">RECOMENDAÇÃO DE NAVEGADOR</div>
                    <div id="welcome-sub" style="animation: fadeIn 1s forwards 0.5s; font-size: 1rem;">Para uma experiência sem anúncios e travamentos</div>
                    <div class="grid-apps">
                        ${renderItemRec('Android TV', 'browser.jpg', 'Browser Here')}
                        ${renderItemRec('Windows', 'brave.jpg', 'Brave')}
                        ${renderItemRec('Android', 'brave.jpg', 'Brave')}
                    </div>
                </div>

            </div>
        </div>
    `;
}

function renderItemRec(nome, icon, disp) {
    return `
        <div class="rec-card">
            <div class="rec-disp">${disp}</div>
            <img src="${icon}" class="rec-icon" onerror="this.style.display='none'">
            <div class="rec-nome">${nome}</div>
        </div>
    `;
}

function renderItemRec(nome, icon, disp) {
    return `
        <div style="display:inline-block; margin: 15px; text-align: center;">
            <img src="${icon}" style="width: 40px; height: 40px; border-radius: 8px;">
            <div style="font-size: 0.65rem; color: #a855f7; font-weight: bold; margin-top: 5px; text-transform: uppercase;">${disp}</div>
            <div style="font-size: 0.8rem; font-weight: bold;">${nome}</div>
        </div>
    `;
}

function exibirAvisoBonito() {
    const playerContainer = document.getElementById('player-container');
    const aviso = document.createElement('div');
    aviso.id = 'aviso-bonito';
    aviso.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
        color: #fff; display: flex; flex-direction: column; align-items: center;
        justify-content: center; z-index: 9999; text-align: center;
        font-family: 'Segoe UI', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        padding: 20px; box-sizing: border-box;
    `;
    aviso.innerHTML = `
        <div id="noise-container"><div id="tv-static"></div></div>
        <div id="welcome-screen">
            <div id="welcome-title">Aviso Importante</div>
            <div id="welcome-sub" style="animation: fadeIn 1s forwards 0.5s">Este canal contém anúncios.<br>
                Caso uma nova janela abra, <b>feche-a</b><br>e retorne ao site para continuar assistindo.</div>
        </div>
    `;
    playerContainer.appendChild(aviso);
    setTimeout(() => { if (aviso) aviso.remove(); }, 3000);
}

// --- 5. NAVEGAÇÃO DAS CATEGORIAS ---
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

// --- INICIALIZAÇÃO ---
window.onload = function() {
    carregarCanaisJSON();
    iniciarTelaInicial();
};
