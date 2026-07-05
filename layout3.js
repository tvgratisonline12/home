let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;
let overlayTimeout;
let refreshTimer;

// --- 1. CARREGAMENTO DO JSON ---
// --- 1. CARREGAMENTO DO JSON COM TOLERÂNCIA A ERROS ---
async function carregarCanaisJSON() {
    try {
        const urls = [
            'https://tvgratis.online/rd.json',
            'https://tvgratis.online/embed.json',
            'https://outro-site.com/lista.json'
        ];

        // Usamos allSettled para não parar se um falhar
        const resultados = await Promise.allSettled(urls.map(url => fetch(url)));

        // Filtramos apenas os que deram sucesso (status === 'fulfilled')
        // E extraímos apenas o JSON dos que funcionaram
        const dadosValidos = [];
        for (const res of resultados) {
            if (res.status === 'fulfilled' && res.value.ok) {
                try {
                    const json = await res.value.json();
                    dadosValidos.push(json);
                } catch (e) {
                    console.warn("Erro ao processar JSON de uma fonte:", e);
                }
            } else {
                console.warn("Falha ao carregar uma das fontes, pulando...");
            }
        }

        // Se nenhum carregou, avisamos o usuário
        if (dadosValidos.length === 0) {
            throw new Error("Nenhuma fonte de canais está disponível.");
        }

        // Consolida e ordena
        canaisRaw = dadosValidos.flat();
        canaisRaw.sort((a, b) => (a.canal || "").localeCompare(b.canal || ""));

        // Lógica de categorias
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
// --- 2. RENDERIZAÇÃO DA LISTA (ATUALIZADA PARA BUSCA) ---
function renderList() {
    const catDisplay = document.getElementById("categoriaAtual");
    if (catDisplay) catDisplay.innerText = categoriaAtual;
    
    const l = document.getElementById('contentList');
    if (!l) return;

    // Pega o valor do seu campo de busca pelo ID 'filter'
    const inputBusca = document.getElementById('filter');
    const termo = inputBusca ? inputBusca.value.toLowerCase() : "";
    
    l.innerHTML = '';
    
    // Filtra considerando a categoria ATUAL e o termo de busca
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
            badgeHtml = '<span class="ad-badge" style="background-color:red; color:white; padding:0 4px; border-radius:3px; margin-right:5px; font-size:10px; font-weight:bold;">AD</span>';
        } else if (qual === '4k') {
            badgeHtml = '<span class="vip-badge" style="background-color:yellow; color:black; padding:0 4px; border-radius:3px; margin-right:5px; font-size:10px; font-weight:bold;">VIP</span>';
        }
        
        div.innerHTML = `
            <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
            ${badgeHtml}
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

// --- 3. PLAYER E LÓGICA DE CANAIS ---
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
    
    const workerHD = "https://open.tvgratisonline12.workers.dev/?url=https://ww4.embedtv.lat/";
    const workerRD = "https://redecanaistv.uk/player3/ch.php?canal=";
    const prefixo4k = "https://embedcanaisdetv.xyz/e/index.php?canal=";
    
    let urlVideo;
    if (qual === "4k") {
        urlVideo = prefixo4k + c.logo + "&autoplay=1&mute=1";
    } else if (qual === "rd") {
        urlVideo = workerRD + c.logo;
    } else if (qual === "hd") {
        urlVideo = workerHD + encodeURIComponent(c.logo);
    } else if (qual === "sd") {
        urlVideo = c.logo + ".m3u8";
    } else {
        urlVideo = c.logo;
    }

    document.getElementById("player").innerHTML = `<iframe id="videoIframe" src="${urlVideo}" allow="autoplay; fullscreen" style="width:100%;height:100%;border:none;pointer-events:auto;"></iframe>`;

    // --- REFRESH CONDICIONAL PARA 4K ---
    if (refreshTimer) clearInterval(refreshTimer);
    if (qual === "4k") {
        refreshTimer = setInterval(() => {
            resetIframe();
            setTimeout(() => {
                const iframe = document.getElementById('videoIframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                }
            }, 2000);
        }, 20000); // 29 minutos
    }

    const overlay = document.getElementById('iframe-overlay');
    // Removido '4k' da lista de bloqueio
    const isDelayedLock = ['rd', 'ad'].includes(qual); 
    const isImmediateLock = ['hd', 'sd'].includes(qual);

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
            }, 12000);
        } else if (isImmediateLock) {
            overlay.style.setProperty('display', 'block', 'important');
        } else {
            overlay.style.setProperty('display', 'none', 'important');
        }
    }
}

// --- 4. FUNÇÕES DE SUPORTE ---
function resetIframe() {
    const playerDiv = document.getElementById("player");
    const antigoIframe = playerDiv.querySelector('iframe');
    if (antigoIframe) {
        const novoIframe = document.createElement('iframe');
        novoIframe.id = "videoIframe";
        novoIframe.src = antigoIframe.src;
        novoIframe.style.cssText = "width:100%;height:100%;border:none;pointer-events:auto;";
        novoIframe.allow = "autoplay; fullscreen";
        playerDiv.replaceChild(novoIframe, antigoIframe);
        try { localStorage.clear(); } catch(e) {}
    }
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
    setTimeout(() => { if (aviso) aviso.remove(); }, 5000);
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
    // Remove o modal VIP do DOM antes de qualquer script disparar
    const vipModal = document.getElementById('vipModal');
    if (vipModal) vipModal.remove();

    carregarCanaisJSON();
    iniciarTelaInicial();
};

// --- 6. OTIMIZAÇÃO PARA TV (D-PAD) ---
document.addEventListener('keydown', function(event) {
    const activeElement = document.activeElement;
    
    // Se o usuário apertar OK (Enter) no teclado/controle
    if (event.key === 'Enter') {
        // Se estiver no Player Container, force o foco no Iframe
        if (activeElement.id === 'player-container' || activeElement.id === 'iframe-overlay') {
            const iframe = document.getElementById('videoIframe');
            if (iframe) {
                iframe.focus();
                // Opcional: Se o player permitir, dispara um clique
                iframe.contentWindow.postMessage('play', '*');
            }
        }
    }
});

// Força o PlayerContainer a ser focável pelo controle remoto
document.getElementById('player-container').setAttribute('tabindex', '0');

// --- 7. LOGICA DE FULLSCREEN PARA TV ---
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        const playerContainer = document.getElementById('player-container');

        // Se o foco estiver no player, ativamos o Fullscreen e o Play
        if (activeElement && activeElement.id === 'videoIframe') {
            
            // 1. Tentar entrar em tela cheia no container principal
            if (playerContainer && !document.fullscreenElement) {
                playerContainer.requestFullscreen().catch(err => {
                    console.log("Erro ao entrar em fullscreen: " + err.message);
                });
            }

            // 2. Enviar sinal de Play para o Iframe
            const iframe = document.getElementById('videoIframe');
            if (iframe && iframe.contentWindow) {
                // Tenta diversos métodos de play para diferentes tipos de players
                iframe.contentWindow.postMessage('play', '*');
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            }
        }
    }
});
