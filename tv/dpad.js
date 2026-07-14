let areaAtual = 'LISTA';
let focoIndex = 0;
let selecionadoIndex = -1; // -1 significa que nada foi selecionado ainda
let clickCount = 0;

// Listener de captura: Intercepta o "Back" antes de chegar ao iframe
window.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        mudarArea('LISTA');
        
        const player = document.getElementById("player");
        if (player) player.innerHTML = ""; 
    }
}, true);

document.addEventListener('keydown', (e) => {
    const listaItens = document.querySelectorAll('#contentList .item');
    const botoesCat = document.querySelectorAll('.cat-btn');
    const btnPl = document.querySelector('#aviso-pl button');

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowUp':
            if (areaAtual === 'LISTA') {
                if (focoIndex > 0) { focoIndex--; atualizarFoco(listaItens); }
                else mudarArea('CATEGORIA');
            }
            break;

        case 'ArrowDown':
            if (areaAtual === 'CATEGORIA') mudarArea('LISTA');
            else if (areaAtual === 'LISTA' && focoIndex < listaItens.length - 1) {
                focoIndex++; atualizarFoco(listaItens);
            }
            break;

        case 'ArrowRight':
            if (areaAtual === 'CATEGORIA') {
                if (document.activeElement === botoesCat[0]) {
                    botoesCat[0].classList.remove('focused');
                    botoesCat[1].classList.add('focused');
                    botoesCat[1].focus();
                } else mudarArea('PLAYER');
            } else if (areaAtual === 'LISTA') mudarArea('PLAYER');
            break;

        case 'ArrowLeft':
            if (areaAtual === 'PLAYER') mudarArea('LISTA');
            else if (areaAtual === 'CATEGORIA') {
                if (document.activeElement === botoesCat[1]) {
                    botoesCat[1].classList.remove('focused');
                    botoesCat[0].classList.add('focused');
                    botoesCat[0].focus();
                }
            }
            break;

        case 'Enter':
            if (areaAtual === 'CATEGORIA') {
                document.activeElement.click();
            } else if (areaAtual === 'LISTA') {
                const canal = listaFiltrada[focoIndex];
                const itemDiv = listaItens[focoIndex];

                // 1. Se for um canal novo, carrega ele
                if (selecionadoIndex !== focoIndex) {
                    selecionadoIndex = focoIndex;
                    playCanal(canal, itemDiv);
                    atualizarFoco(listaItens);
                    clickCount = 0; // Reseta contador
                } 
                // 2. Se for o mesmo canal, gerencia Fullscreen
                else {
                    clickCount++;
                    if (clickCount === 2) {
                        toggleFullScreen();
                        clickCount = 0;
                    } else {
                        // Clique único no canal já ativo: mantém ou entra em fullscreen
                        toggleFullScreen(); 
                        setTimeout(() => clickCount = 0, 500);
                    }
                }
            } else if (areaAtual === 'PLAYER') {
                if (btnPl) btnPl.click();
                else toggleFullScreen();
            }
            break;
    }
});

function mudarArea(novaArea) {
    areaAtual = novaArea;
    document.querySelectorAll('.item, .cat-btn, #player-container').forEach(el => el.classList.remove('focused'));
    if (document.activeElement) document.activeElement.blur();
    
    if (areaAtual === 'LISTA') {
        const itens = document.querySelectorAll('#contentList .item');
        if(itens.length > 0) {
            // Se tiver algo selecionado, foca no selecionadoIndex, senão no 0
            focoIndex = (selecionadoIndex !== -1) ? selecionadoIndex : 0;
            itens[focoIndex].classList.add('focused');
            itens[focoIndex].scrollIntoView({ block: 'center' });
            document.body.focus();
        }
    } else if (areaAtual === 'CATEGORIA') {
        const cat0 = document.querySelectorAll('.cat-btn')[0];
        cat0.classList.add('focused');
        cat0.focus();
    } else if (areaAtual === 'PLAYER') {
        document.getElementById('player-container').classList.add('focused');
        const btnPl = document.querySelector('#aviso-pl button');
        if (btnPl) btnPl.focus();
    }
}

function atualizarFoco(lista) {
    lista.forEach((item, idx) => {
        item.classList.toggle('focused', idx === focoIndex); // Cursor
        item.classList.toggle('active', idx === selecionadoIndex); // Canal tocando
        if (idx === focoIndex) item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}
