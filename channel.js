let canaisRaw = [];
let categorias = [];
let categoriaAtual = "Todos";
let indiceCategoria = 0;
let isSmartBuffering = false;
let fadeTimeout;
let overlayTimeout;

async function carregarCanaisJSON() {
    try {
        const response = await fetch('https://tvgratis.online/45s84e1sfer.json');
        if (!response.ok) throw new Error('Falha');
        canaisRaw = await response.json();
        const s = new Set(["Todos"]);
        canaisRaw.forEach(c => { (c.categorias || []).forEach(x => { if (x != "Todos") s.add(x); }); });
        categorias = [...s];
        renderList();
    } catch (error) {
        document.getElementById('contentList').innerHTML = `<div class="item" style="color:red; text-align:center;">Erro ao Ler a Lista de Canais</div>`;
    }
}

function toggleFullScreen() {
    const c = document.getElementById('player-container');
    if (!document.fullscreenElement) {
        c.requestFullscreen().catch(err => console.error("Erro full screen:", err));
    } else {
        document.exitFullscreen();
    }
}

function renderList() {
    document.getElementById("categoriaAtual").innerText = categoriaAtual;
    const l = document.getElementById('contentList');
    l.innerHTML = '';
    
    const lista = canaisRaw.filter(c => {
        if (categoriaAtual === "Todos") return true;
        return (c.categorias || []).includes(categoriaAtual);
    });

    lista.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'item';
        const isFhd = String(item.qualidade).toLowerCase() === "fhd";
        
        div.innerHTML = `
            <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
            ${isFhd ? '<span class="ad-badge">AD</span>' : ''}
            <span>${item.canal || "Canal"}</span>
        `;

        div.onclick = () => playCanal(item, div);

        div.ondblclick = () => {
            playCanal(item, div);
            setTimeout(() => {
                const container = document.getElementById('player-container');
                if (container && !document.fullscreenElement) container.requestFullscreen();
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

    const bar = document.getElementById('custom-progress-bar');
    bar.style.display = "block"; bar.style.opacity = "1";
    document.getElementById('time-display').style.opacity = "1";

    clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => {
        bar.style.opacity = "0";
        document.getElementById('time-display').style.opacity = "0";
        setTimeout(() => { bar.style.display = "none"; }, 1000);
    }, 5000);

    const workerPrefix = "https://delicate-feather-5576.futebolsemdelay.workers.dev/?url=https://ww4.embedtv.lat/";
    let urlVideo = c.qualidade === "hd" ? workerPrefix + encodeURIComponent(c.logo) : (c.qualidade === "sd" ? c.logo + ".m3u8" : c.logo);
    document.getElementById("player").innerHTML = `<iframe src="${urlVideo}" allowfullscreen allow="autoplay; fullscreen" style="width:100%;height:100%;border:none;"></iframe>`;

    // Lógica Overlay e Aviso FHD
    let overlay = document.getElementById('iframe-overlay');
    let adWarning = document.getElementById('ad-warning');
    const isFhd = String(c.qualidade).toLowerCase() === "fhd";

    if (overlay) {
        clearTimeout(overlayTimeout);
        if (isFhd) {
            overlay.style.display = "none";
            overlayTimeout = setTimeout(() => { overlay.style.display = "block"; }, 10000);
            
            // Exibir aviso
            if (adWarning) {
                adWarning.innerText = "Canal FHD: Se abrir nova janela, feche-a e volte ao site.";
                adWarning.style.display = "block";
                adWarning.style.opacity = "1";
                setTimeout(() => {
                    adWarning.style.opacity = "0";
                    setTimeout(() => { adWarning.style.display = "none"; }, 500);
                }, 8000);
            }
        } else {
            overlay.style.display = "block";
            if (adWarning) adWarning.style.display = "none";
        }
    }
}

function clearPlayer() { 
    document.getElementById("player").innerHTML = ""; 
    const buffer = document.getElementById("smart-buffer-overlay");
    if(buffer) buffer.style.display = "none"; 
    isSmartBuffering = false; 
}

function proximaCategoria() { indiceCategoria = (indiceCategoria + 1) % categorias.length; categoriaAtual = categorias[indiceCategoria]; renderList(); }
function categoriaAnterior() { indiceCategoria = (indiceCategoria - 1 + categorias.length) % categorias.length; categoriaAtual = categorias[indiceCategoria]; renderList(); }

function iniciarTelaInicial() {
    const p = document.getElementById('player');
    if(!p) return;
    p.innerHTML = `<div id="noise-container"><div id="tv-static"></div></div><div id="welcome-screen"><div id="welcome-title">TVGrátis.Online</div></div>`;
    setTimeout(() => { let w = document.getElementById('welcome-screen'); if (w) w.style.opacity = '0'; }, 5000);
}

window.onload = function () { carregarCanaisJSON(); iniciarTelaInicial(); };
