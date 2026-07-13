let areaAtual = 'LISTA'; // 'CATEGORIA', 'LISTA', 'PLAYER'
let focoIndex = 0;
let clickCount = 0;

document.addEventListener('keydown', (e) => {
    const listaItens = document.querySelectorAll('#contentList .item');
    const botoesCat = document.querySelectorAll('.cat-btn');

    switch (e.key) {
        case 'ArrowUp':
            if (areaAtual === 'LISTA' && focoIndex === 0) {
                mudarArea('CATEGORIA');
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
                
                // Lógica de Double Click para Fullscreen
                clickCount++;
                if (clickCount === 2) {
                    toggleFullScreen();
                    clickCount = 0;
                } else {
                    setTimeout(() => clickCount = 0, 500); // Reseta se não apertar rápido
                }
            }
            break;
    }
});

function mudarArea(novaArea) {
    areaAtual = novaArea;
    // Remove focos de tudo
    document.querySelectorAll('.item, .cat-btn').forEach(el => el.classList.remove('focused'));
    
    if (areaAtual === 'LISTA') {
        focoIndex = 0;
        document.querySelectorAll('#contentList .item')[0].classList.add('focused');
    } else if (areaAtual === 'CATEGORIA') {
        botoesCat[1].focus(); // Foca no botão da direita (próxima)
        botoesCat[1].classList.add('focused');
    }
}
