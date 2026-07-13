let areaAtual = 'LISTA';
let focoIndex = 0;
let clickCount = 0;

document.addEventListener('keydown', (e) => {
    const listaItens = document.querySelectorAll('#contentList .item');
    const botoesCat = document.querySelectorAll('.cat-btn');

    // Impede que as setas rolem a página do navegador (comportamento padrão)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowUp':
            if (areaAtual === 'LISTA') {
                if (focoIndex > 0) {
                    focoIndex--;
                    atualizarFoco(listaItens);
                } else {
                    mudarArea('CATEGORIA', botoesCat[0]);
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
            // ... (sua lógica de click atual)
            break;
    }
});

function mudarArea(novaArea, elementoFoco = null) {
    areaAtual = novaArea;
    // Limpa todos os focos
    document.querySelectorAll('.item, .cat-btn, #player-container').forEach(el => el.classList.remove('focused'));
    
    if (areaAtual === 'LISTA') {
        const itens = document.querySelectorAll('#contentList .item');
        if(itens.length > 0) {
            focoIndex = 0; // Sempre reseta pro topo ao voltar
            itens[0].classList.add('focused');
        }
    } else if (areaAtual === 'CATEGORIA') {
        elementoFoco.classList.add('focused');
    } else if (areaAtual === 'PLAYER') {
        document.getElementById('player-container').classList.add('focused');
    }
}
