let areaAtual = 'LISTA';
let focoIndex = 0;
let clickCount = 0;

document.addEventListener('keydown', (e) => {
    const listaItens = document.querySelectorAll('#contentList .item');
    const botoesCat = document.querySelectorAll('.cat-btn');
    
    // Tratamento especial para o botão dentro do player (tipo PL)
    const btnPl = document.querySelector('#aviso-pl button');
    if (btnPl && areaAtual === 'PLAYER') {
        if (['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            btnPl.focus();
            if (e.key === 'Enter') btnPl.click();
            return;
        }
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) e.preventDefault();

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
                // Alterna entre botão 0 (prev) e 1 (next)
                if (document.activeElement === botoesCat[0]) {
                    botoesCat[1].focus();
                    botoesCat[0].classList.remove('focused');
                    botoesCat[1].classList.add('focused');
                } else {
                    mudarArea('PLAYER');
                }
            } else if (areaAtual === 'LISTA') {
                mudarArea('PLAYER');
            }
            break;

        case 'ArrowLeft':
            // NOVO: Escape forçado se estiver no botão do player
            const btnPlFocado = document.querySelector('#aviso-pl button');
            if (btnPlFocado && document.activeElement === btnPlFocado) {
                mudarArea('LISTA');
            } 
            // Lógica original para as outras áreas
            else if (areaAtual === 'PLAYER') {
                mudarArea('LISTA');
            } else if (areaAtual === 'CATEGORIA') {
                if (document.activeElement === botoesCat[1]) {
                    botoesCat[0].focus();
                    botoesCat[1].classList.remove('focused');
                    botoesCat[0].classList.add('focused');
                }
            }
            break;

        case 'Enter':
            if (areaAtual === 'CATEGORIA') document.activeElement.click();
            else if (areaAtual === 'LISTA') {
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
    document.querySelectorAll('.item, .cat-btn, #player-container').forEach(el => el.classList.remove('focused'));
    
    if (areaAtual === 'LISTA') {
        const itens = document.querySelectorAll('#contentList .item');
        if(itens.length > 0) {
            itens[0].classList.add('focused');
            focoIndex = 0;
        }
    } else if (areaAtual === 'CATEGORIA') {
        const cat0 = document.querySelectorAll('.cat-btn')[0];
        cat0.classList.add('focused');
        cat0.focus();
    } else if (areaAtual === 'PLAYER') {
        document.getElementById('player-container').classList.add('focused');
        // Se for o aviso PL, foca no botão de abrir
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
