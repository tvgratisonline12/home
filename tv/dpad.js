// dpad.js
let focoIndex = -1; // -1 indica que nenhum canal está selecionado

document.addEventListener('keydown', (e) => {
    const listaItens = document.querySelectorAll('#contentList .item');
    if (listaItens.length === 0) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            focoIndex = Math.min(focoIndex + 1, listaItens.length - 1);
            atualizarFoco(listaItens);
            break;
        case 'ArrowUp':
            e.preventDefault();
            focoIndex = Math.max(focoIndex - 1, 0);
            atualizarFoco(listaItens);
            break;
        case 'Enter':
            if (focoIndex >= 0 && focoIndex < listaItens.length) {
                listaItens[focoIndex].click(); // Executa o playCanal do seu código
            }
            break;
        case 'ArrowRight':
        case 'ArrowLeft':
            // Se quiser navegação de categorias aqui, adicione:
            // e.key === 'ArrowRight' ? proximaCategoria() : categoriaAnterior();
            break;
    }
});

function atualizarFoco(lista) {
    lista.forEach((item, idx) => {
        if (idx === focoIndex) {
            item.classList.add('focused');
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            item.classList.remove('focused');
        }
    });
}
