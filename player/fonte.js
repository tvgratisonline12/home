// fonte.js

// 1. Guardamos a referência da função original para não perdê-la
const originalRenderList = window.renderList;

// 2. Sobrescrevemos a função original
window.renderList = function() {
    // Executa a lógica original primeiro
    originalRenderList();

    // 3. Agora, selecionamos todos os itens da lista que foram criados
    const items = document.querySelectorAll('#contentList .item');
    
    items.forEach((div, idx) => {
        // Precisamos recuperar o objeto do canal original. 
        // Como o 'idx' é consistente, pegamos de 'canaisRaw'
        const item = canaisRaw[idx]; 
        if (!item) return;

        const qual = String(item.qualidade || "").toLowerCase();
        
        // Mapeamento de fontes
        const mapas = {
            'rd': { label: 'FONTE 1', cor: '#e74c3c' },
            'eb': { label: 'FONTE 2', cor: '#3498db' },
            'ec': { label: 'FONTE 3', cor: '#27ae60' },
            'cx': { label: 'FONTE 4', cor: '#f39c12' }
        };

        const config = mapas[qual];

        // Se tiver uma configuração, adicionamos o badge no final da div
        if (config) {
            const badge = document.createElement('span');
            badge.innerHTML = config.label;
            badge.style.cssText = `
                background-color: ${config.cor};
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                margin-left: 8px;
                font-size: 9px;
                font-weight: bold;
                vertical-align: middle;
                text-transform: uppercase;
                display: inline-block;
            `;
            div.appendChild(badge);
        }
    });
};
