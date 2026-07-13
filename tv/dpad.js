let areaAtual = 'LISTA'; // Áreas: 'CATEGORIA', 'LISTA', 'PLAYER'
let focoIndex = 0;
let clickCount = 0;

document.addEventListener('keydown', (e) => {
    const listaItens = document.querySelectorAll('#contentList .item');
    const botoesCat = document.querySelectorAll('.cat-btn');

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowUp':
            if (areaAtual === 'LISTA') {
                if (focoIndex > 0) {
                    focoIndex--;
                    atualizarFoco(listaItens);
                } else {
                    mudarArea('CATEGORIA');
                }
            }
            break;

        case 'ArrowDown':
            if (areaAtual === 'CATEGORIA') {
                mudarArea('LISTA');
            } else if (areaAtual === 'LISTA' && focoIndex < listaItens.length - 1) {
                focoIndex++;
                atualizarFoco(listaItens);
            }
            break;

        case 'ArrowRight':
            if (areaAtual === 'CATEGORIA') {
                // Navega entre botões de categoria ou vai pro player
                if (document.activeElement === botoesCat[0]) botoesCat[1].focus();
                else mudarArea('PLAYER');
            } else if (areaAtual === 'LISTA') {
                mudarArea('PLAYER');
            }
            break;

        case 'ArrowLeft':
            if (areaAtual === 'PLAYER') {
                mudarArea('LISTA');
            } else if (areaAtual === 'CATEGORIA') {
                if (document.activeElement === botoesCat[1]) botoesCat[0].focus();
            }
            break;

        case 'Enter':
            if (areaAtual === 'CATEGORIA') {
                document.activeElement.click();
            } else if (areaAtual === 'LISTA') {
                clickCount++;
                if (clickCount === 2) {
                    listaItens[focoIndex].click(); // Abre
                    toggleFullScreen();           // Fullscreen
                    clickCount = 0;
                } else {
                    listaItens[focoIndex].click(); // Apenas abre
                    setTimeout(() => clickCount = 0, 500);
                }
            } else if (areaAtual === 'PLAYER') {
                toggleFullScreen();
            }
            break;
    }
});

function mudarArea(novaArea) {
    areaAtual = novaArea;
    document.querySelectorAll('.item, .cat-btn, #player-container').forEach(el => el.classList.remove('focused'));
    
    if (areaAtual === 'LISTA') {
        const itens = document.querySelectorAll('#contentList .item');
        if(itens.length > 0) itens[0].classList.add('focused');
    } else if (areaAtual === 'CATEGORIA') {
        document.querySelectorAll('.cat-btn')[0].classList.add('focused');
        document.querySelectorAll('.cat-btn')[0].focus();
    } else if (areaAtual === 'PLAYER') {
        document.getElementById('player-container').classList.add('focused');
    }
}

function atualizarFoco(lista) {
    lista.forEach((item, idx) => {
        item.classList.toggle('focused', idx === focoIndex);
        if (idx === focoIndex) item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}
