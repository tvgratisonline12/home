let canaisRaw = [];
let categorias = [];
let categoriaAtual = 'Todos';
let indiceCategoria = 0;
let overlayTimeout;

// --- 1. CARREGAMENTO DO JSON ---
async function carregarCanaisJSON() {
    try {
        const response = await fetch('https://tvgratis.online/45s84e1free.json');
        if (!response.ok) throw new Error('Falha ao conectar');
        canaisRaw = await response.json();
        
        // Extração de categorias
        const s = new Set(['Todos']);
        canaisRaw.forEach(c => { 
            if (c.categorias && Array.isArray(c.categorias)) {
                c.categorias.forEach(cat => s.add(cat));
            }
        });
        categorias = Array.from(s);
        
        // Renderiza a lista inicial após carregar os dados
        renderList();
    } catch (error) {
        console.error("Erro ao carregar lista de canais:", error);
        const l = document.getElementById('contentList');
        if (l) l.innerHTML = `<div style="color:red; text-align:center;">Erro ao carregar lista. Tente recarregar.</div>`;
    }
}

// --- 2. BUSCA E RENDERIZAÇÃO ---
function filtrarCanais(termo) {
    const listaFiltrada = canaisRaw.filter(c => 
        c.canal.toLowerCase().includes(termo.toLowerCase())
    );
    renderList(listaFiltrada);
}

function renderList(listaParam = null) {
    const l = document.getElementById('contentList');
    if (!l) return;
    
    // Atualiza o texto da categoria no topo
    const catDisplay = document.getElementById("categoriaAtual");
    if (catDisplay) catDisplay.innerText = categoriaAtual;

    l.innerHTML = '';
    
    const lista = listaParam || (categoriaAtual === "Todos" 
        ? canaisRaw 
        : canaisRaw.filter(c => (c.categorias || []).includes(categoriaAtual)));
    
    lista.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'item';
        
        const qual = String(item.qualidade || '').toLowerCase();
        let badgeHtml = '';
        if (['fhd', 'ad'].includes(qual)) {
            badgeHtml = '<span style="background-color:red; color:white; padding:0 4px; border-radius:3px; margin-right:5px; font-size:10px;">AD</span>';
        } else if (qual === '4k') {
            badgeHtml = '<span style="background-color:yellow; color:black; padding:0 4px; border-radius:3px; margin-right:5px; font-size:10px;">VIP</span>';
        }
        
        div.innerHTML = `<span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span> ${badgeHtml} <span>${item.canal || "Canal"}</span>`;
        div.onclick = () => playCanal(item, div);
        l.appendChild(div);
    });
}

// --- 3. PLAYER E LÓGICA DE CANAIS ---
function playCanal(c, el) {
    const qual = String(c.qualidade || '').toLowerCase();
    
    // Aviso Automático
    const avisoAntigo = document.getElementById('aviso-bonito');
    if (avisoAntigo) avisoAntigo.remove();
    if (qual === 'ad' || qual === 'fhd') exibirAvisoBonito();
    
    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    
    const playerDiv = document.getElementById("player");
    playerDiv.innerHTML = "";
    
    const urlVideo = (qual === "4k") ? "https://embedcanaisdetv.xyz/e/index.php?canal=" + c.logo :
                     (qual === "fhd") ? "https://redecanaistv.uk/player3/ch.php?canal=" + c.logo :
                     (qual === "hd")  ? "https://open.tvgratisonline12.workers.dev/?url=https://ww4.embedtv.lat/" + encodeURIComponent(c.logo) :
                     (qual === "sd")  ? c.logo + ".m3u8" : c.logo;

    const iframe = document.createElement('iframe');
    iframe.src = urlVideo;
    iframe.id = "canalIframe";
    iframe.style.cssText = "width:100%;height:100%;border:none;pointer-events:auto;";
    iframe.allow = "autoplay; fullscreen";
    iframe.allowFullscreen = true;

    if (qual === "4k") {
        iframe.onload = () => {
            try {
                iframe.contentDocument.head.insertAdjacentHTML('beforeend', '<style>.vip-modal-overlay, .vip-modal-content, #vipModal { display: none !important; }</style>');
            } catch (e) { console.warn("Injeção 4K bloqueada pelo CORS"); }
        };
    }
    playerDiv.appendChild(iframe);

    // Overlay de Fullscreen
    const overlay = document.getElementById('iframe-overlay');
    if (overlay) {
        overlay.ondblclick = () => {
            const container = document.getElementById('player-container');
            if (!document.fullscreenElement) container.requestFullscreen();
            else document.exitFullscreen();
        };
        
        clearTimeout(overlayTimeout);
        overlay.style.display = ['fhd', 'ad', '4k'].includes(qual) ? 'none' : 'block';
        if (['fhd', 'ad', '4k'].includes(qual)) {
            overlayTimeout = setTimeout(() => overlay.style.display = 'block', 10000);
        }
    }
}

// --- 4. FUNÇÕES DE SUPORTE ---
function exibirAvisoBonito() {
    const aviso = document.createElement('div');
    aviso.id = 'aviso-bonito';
    aviso.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; text-align: center; font-family: sans-serif; padding: 20px;";
    aviso.innerHTML = "<h2>AVISO IMPORTANTE</h2><p style='font-size:18px;'>Este canal contém anúncios.<br>Caso uma nova janela abra, feche-a e retorne ao site.</p>";
    document.getElementById('player-container').appendChild(aviso);
    setTimeout(() => aviso.remove(), 4000);
}

window.onload = () => {
    carregarCanaisJSON();
};
