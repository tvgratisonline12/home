let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;

// --- FUNÇÃO AUXILIAR: FULLSCREEN ---
function toggleFullscreen() {
    const container = document.getElementById('player-container');
    if (!container) return;
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
}

// --- CARREGAMENTO E LISTA ---
async function carregarCanaisJSON() {
    try {
        const response = await fetch('https://tvgratis.online/45s84e1sfer.json');
        if (!response.ok) throw new Error('Falha');
        canaisRaw = await response.json();
        const s = new Set(['Todos']);
        canaisRaw.forEach(c => { 
            if (c.categorias && Array.isArray(c.categorias)) c.categorias.forEach(cat => s.add(cat));
        });
        categorias = Array.from(s);
        renderList();
    } catch (e) {
        console.error("Erro no JSON");
    }
}

function renderList() {
    const l = document.getElementById('contentList');
    if (!l) return;
    l.innerHTML = '';
    const lista = canaisRaw.filter(c => categoriaAtual === "Todos" || (c.categorias || []).includes(categoriaAtual));
    
    lista.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `<span>${(idx + 1).toString().padStart(2, '0')} - ${item.canal}</span>`;
        
        // Clique simples: Toca
        div.onclick = () => playCanal(item, div);
        // Clique duplo no nome do canal: Fullscreen
        div.ondblclick = () => {
            playCanal(item, div);
            setTimeout(toggleFullscreen, 500);
        };
        l.appendChild(div);
    });
}

// --- PLAYER E LÓGICA DE OVERLAY ---
function playCanal(c, el) {
    let nc = document.getElementById('noise-container'); if (nc) nc.remove();
    let s = document.getElementById('tv-static'); if (s) s.remove();
    let w = document.getElementById('welcome-screen'); if (w) w.remove();
    
    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    clearPlayer();
    
    const playerDiv = document.getElementById("player");
    let urlVideo = (c.qualidade === "4k") ? "https://embedcanaisdetv.xyz/e/index.php?canal=" + c.logo :
                   (c.qualidade === "fhd") ? "https://redecanaistv.uk/player3/ch.php?canal=" + c.logo :
                   (c.qualidade === "hd") ? "https://open.tvgratisonline12.workers.dev/?url=https://ww4.embedtv.lat/" + encodeURIComponent(c.logo) : c.logo;

    playerDiv.innerHTML = `
        <div id="player-wrapper-outer" style="position:relative; width:100%; height:100%;">
            <iframe id="main-iframe" src="${urlVideo}" allowfullscreen allow="autoplay; fullscreen" style="width:100%;height:100%;border:none;"></iframe>
            <div id="dynamic-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:transparent; z-index:50; display:none; cursor:pointer;"></div>
        </div>
    `;

    const overlay = document.getElementById('dynamic-overlay');
    
    // Configura clique duplo no overlay (Fullscreen)
    let clickCount = 0;
    overlay.onclick = () => {
        clickCount++;
        if (clickCount === 2) { toggleFullscreen(); clickCount = 0; }
        setTimeout(() => { clickCount = 0; }, 300);
    };

    // REGRA DOS 10 SEGUNDOS:
    // FHD e 4K: Espera 10s para exibir o overlay. HD e SD: Exibe imediato.
    const delay = (c.qualidade === "4k" || c.qualidade === "fhd") ? 10000 : 0;
    
    // Aviso de Anúncio apenas para FHD
    if (c.qualidade === "fhd") exibirAvisoBonito();

    setTimeout(() => {
        const aviso = document.getElementById('aviso-bonito');
        if (aviso) aviso.remove();
        overlay.style.setProperty('display', 'block', 'important');
    }, delay);
}

function exibirAvisoBonito() {
    const container = document.getElementById('player-container');
    const aviso = document.createElement('div');
    aviso.id = 'aviso-bonito';
    aviso.style.cssText = "position:absolute; top:0; width:100%; height:100%; background:#000; color:#fff; display:flex; align-items:center; justify-content:center; z-index:100; text-align:center;";
    aviso.innerHTML = "AVISO: Este canal contém anúncios.<br>Se abrir nova janela, feche-a imediatamente.";
    container.appendChild(aviso);
}

function clearPlayer() { document.getElementById("player").innerHTML = ""; }

function iniciarTelaInicial() {
    document.getElementById('player').innerHTML = `<div id="welcome-screen">Escolha um canal</div>`;
}

window.onload = function() {
    carregarCanaisJSON();
    iniciarTelaInicial();
};
