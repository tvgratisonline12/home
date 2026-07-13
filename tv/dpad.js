let areaAtual = 'LISTA'; // 'CATEGORIA', 'LISTA', 'PLAYER'
let focoIndex = 0;
let clickCount = 0;

document.addEventListener('keydown', (e) => {
    const listaItens = document.querySelectorAll('#contentList .item');
    const botoesCat = document.querySelectorAll('.cat-btn');
    const containerPlayer = document.getElementById('player-container');

    switch (e.key) {
        case 'ArrowUp':
            if (areaAtual === 'LISTA' && focoIndex === 0) {
                mudarArea('CATEGORIA', botoesCat[0]);
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
            if (areaAtual === 'LISTA' || areaAtual === 'CATEGORIA') {
                mudarArea('PLAYER');
            }
            break;

        case 'ArrowLeft':
            if (areaAtual === 'PLAYER') {
                mudarArea('LISTA');
            }
            break;

        case 'Enter':
            if (areaAtual === 'CATEGORIA') {
                document.activeElement.click();
            } else if (areaAtual === 'LISTA') {
                listaItens[focoIndex].click();
                clickCount++;
                if (clickCount === 2) {
                    toggleFullScreen();
                    clickCount = 0;
                } else {
                    setTimeout(() => clickCount = 0, 500);
                }
            }
            break;
    }
});

function mudarArea(novaArea, elementoFoco = null) {
    areaAtual = novaArea;
    document.querySelectorAll('.item, .cat-btn').forEach(el => el.classList.remove('focused'));
    
    if (areaAtual === 'LISTA') {
        focoIndex = 0;
        const itens = document.querySelectorAll('#contentList .item');
        if(itens.length > 0) itens[0].classList.add('focused');
    } else if (areaAtual === 'CATEGORIA') {
        elementoFoco.classList.add('focused');
        elementoFoco.focus();
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
