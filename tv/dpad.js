let areaAtual = 'LISTA'; 
let focoIndex = 0;
let clickCount = 0;

// Listener de captura: Intercepta o "Back" antes do iframe
window.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        // Força a volta para a lista, independentemente de onde esteja o foco
        mudarArea('LISTA');
        
        // Se houver um player de vídeo, você pode opcionalmente limpar o container
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
                } else {
                    mudarArea('PLAYER');
                }
            } else if (areaAtual === 'LISTA') {
                mudarArea('PLAYER');
            }
            break;

        case 'ArrowLeft':
            // Se estiver no botão PL dentro do player, sai para a LISTA
            if (areaAtual === 'PLAYER') {
                mudarArea('LISTA');
            } else if (areaAtual === 'CATEGORIA') {
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
                clickCount++;
                listaItens[focoIndex].click();
                if (clickCount === 2) { toggleFullScreen(); clickCount = 0; }
                else setTimeout(() => clickCount = 0, 500);
            } else if (areaAtual === 'PLAYER') {
                if (btnPl) btnPl.click();
                else toggleFullScreen();
            }
            break;
    }
});

function mudarArea(novaArea) {
    areaAtual = novaArea;
    // Tira foco de tudo e limpa as classes
    document.querySelectorAll('.item, .cat-btn, #player-container').forEach(el => el.classList.remove('focused'));
    if (document.activeElement) document.activeElement.blur();
    
    if (areaAtual === 'LISTA') {
        const itens = document.querySelectorAll('#contentList .item');
        if(itens.length > 0) {
            focoIndex = 0;
            itens[0].classList.add('focused');
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
        item.classList.toggle('focused', idx === focoIndex);
        if (idx === focoIndex) item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}
