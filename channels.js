let canaisRaw = [];
let categorias = [];
let categoriaAtual = "Todos";
let indiceCategoria = 0;
let isSmartBuffering = false;
let objBufferTarget = 30;
let maxPercentReached = 0;
let fadeTimeout;

async function carregarCanaisJSON() {
    try {
        const response = await fetch('45s84e1sfer.json');
        if (!response.ok) throw new Error('Falha');

        canaisRaw = await response.json();

        const s = new Set(["Todos"]);
        canaisRaw.forEach(c => {
            (c.categorias || []).forEach(x => {
                if (x !== "Todos") s.add(x);
            });
        });

        categorias = [...s];
        renderList();

    } catch (error) {
        document.getElementById('contentList').innerHTML =
            `<div class="item" style="color:red;text-align:center;">Erro ao Ler a Lista de Canais</div>`;
    }
}

function toggleFullScreen() {

    const container = document.getElementById("player-container");

    if (!document.fullscreenElement) {

        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }

    } else {

        if (document.exitFullscreen) {
            document.exitFullscreen();
        }

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

        if (isFhd) {

            div.classList.add('has-ad');

            div.innerHTML = `
                <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
                <span class="ad-badge">AD</span>
                <span>${item.canal || "Canal"}</span>
            `;

        } else {

            div.innerHTML = `
                <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
                <span>${item.canal || "Canal"}</span>
            `;

        }

        // Um clique = abre o canal
        div.onclick = () => {

            playCanal(item, div);

            let overlay = document.getElementById('iframe-overlay');

            if (overlay) {
                overlay.style.display = isFhd ? "none" : "block";
            }

        };

        // Dois cliques = tela cheia
        div.ondblclick = () => {

            toggleFullScreen();

        };

        l.appendChild(div);

    });

}

function proximaCategoria() {

    indiceCategoria = (indiceCategoria + 1) % categorias.length;
    categoriaAtual = categorias[indiceCategoria];
    renderList();

}

function categoriaAnterior() {

    indiceCategoria = (indiceCategoria - 1 + categorias.length) % categorias.length;
    categoriaAtual = categorias[indiceCategoria];
    renderList();

}

function playCanal(c, el) {

    let nc = document.getElementById('noise-container');
    if (nc) nc.remove();

    let s = document.getElementById('tv-static');
    if (s) s.remove();

    let w = document.getElementById('welcome-screen');
    if (w) w.remove();

    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    clearPlayer();

    const bar = document.getElementById('custom-progress-bar');

    bar.style.display = "block";
    bar.style.opacity = "1";

    document.getElementById('time-display').style.opacity = "1";

    clearTimeout(fadeTimeout);

    fadeTimeout = setTimeout(() => {

        bar.style.opacity = "0";
        document.getElementById('time-display').style.opacity = "0";

        setTimeout(() => {

            bar.style.display = "none";

        }, 1000);

    }, 5000);

    const workerPrefix =
        "https://delicate-feather-5576.futebolsemdelay.workers.dev/?url=https://ww4.embedtv.lat/";

    let urlVideo;

    if (c.qualidade === "hd") {

        urlVideo = workerPrefix + encodeURIComponent(c.logo);

    } else if (c.qualidade === "sd") {

        urlVideo = c.logo + ".m3u8";

    } else {

        urlVideo = c.logo;

    }

    document.getElementById("player").innerHTML = `
        <iframe
            src="${urlVideo}"
            allow="autoplay; fullscreen"
            allowfullscreen
            style="width:100%;height:100%;border:none;">
        </iframe>
    `;

}

function clearPlayer() {

    document.getElementById("player").innerHTML = "";
    document.getElementById("smart-buffer-overlay").style.display = "none";
    isSmartBuffering = false;

}

function filterList() {

    let v = document.getElementById('filter').value.toLowerCase();

    document.querySelectorAll('.item').forEach(el => {

        el.style.display = el.innerText.toLowerCase().includes(v)
            ? 'flex'
            : 'none';

    });

}

function iniciarTelaInicial() {

    const p = document.getElementById('player');

    p.innerHTML = `
        <div id="noise-container">
            <div id="tv-static"></div>
        </div>

        <div id="welcome-screen">
            <div id="welcome-title">TVGrátis.Online</div>

            <div id="welcome-sub" style="animation: fadeIn 1s forwards 0.5s">
                Escolha um canal para começar
            </div>
        </div>
    `;

    document.getElementById('noise-container').style.display = 'block';

    setTimeout(() => {

        let w = document.getElementById('welcome-screen');

        if (w) {

            w.style.transition = 'opacity .8s';
            w.style.opacity = '0';

            setTimeout(() => {

                w.remove();

                document.getElementById('tv-static').style.opacity = '.15';

            }, 800);

        }

    }, 5000);

}

window.onload = function () {

    carregarCanaisJSON();
    iniciarTelaInicial();

};
