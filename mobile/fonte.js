// fonte.js

// Mapeamento das qualidades para os badges e categorias
const estilosFonte = {
    'rd': { label: 'FONTE 1', cor: '#ef4444', categoria: 'FONTE 1' },
    'eb': { label: 'FONTE 2', cor: '#3b82f6', categoria: 'FONTE 2' },
    'ec': { label: 'FONTE 3', cor: '#22c55e', categoria: 'FONTE 3' },
    'sd': { label: 'FONTE 4', cor: '#f59e0b', categoria: 'FONTE 4' }, // Corrigido de 'cx' para 'sd'
    'pl': { label: 'FONTE 5', cor: '#a855f7', categoria: 'FONTE 5' }
};

// Sobrescreve a renderização original para injetar badges e filtro inteligente
window.renderList = function() {
    const l = document.getElementById('contentList');
    if (!l) return;
    
    // Atualiza o display da categoria no HTML original
    const catDisplay = document.getElementById("categoriaAtual");
    if (catDisplay) catDisplay.innerText = categoriaAtual;

    const inputBusca = document.getElementById('filter');
    const termo = inputBusca ? inputBusca.value.toLowerCase() : "";
    
    // Garante que as FONTES estejam no array global de categorias
    Object.values(estilosFonte).forEach(f => {
        if (!categorias.includes(f.categoria)) {
            categorias.push(f.categoria);
        }
    });
    
    l.innerHTML = '';
    
    // Filtro Híbrido: JSON (Categorias) + Qualidades (Fontes)
    const lista = canaisRaw.filter(c => {
        const qual = (c.qualidade || "").toString().trim().toLowerCase();
        const fonteConfig = estilosFonte[qual];
        const isFonteCategory = Object.values(estilosFonte).some(f => f.categoria === categoriaAtual);
        
        let matchCategoria = false;
        if (categoriaAtual === "Todos") {
            matchCategoria = true;
        } else if (isFonteCategory) {
            matchCategoria = (fonteConfig && fonteConfig.categoria === categoriaAtual);
        } else {
            matchCategoria = (c.categorias || []).includes(categoriaAtual);
        }
        
        const matchBusca = (c.canal || "").toLowerCase().includes(termo);
        return matchCategoria && matchBusca;
    });
    
    lista.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'item';
        
        const qual = (item.qualidade || "").toString().trim().toLowerCase();
        
        // --- Badges Originais ---
        let badgeHtml = '';
        if (['rd', 'ad'].includes(qual)) {
            badgeHtml = '<span class="ad-badge" style="background-color:red; color:white; padding:0 4px; border-radius:3px; margin-left:5px; font-size:10px; font-weight:bold;">AD</span>';
        }
        let plIcon = (qual === 'pl') ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-left:6px;"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 14v7H3V3h7"/></svg>` : '';

        // --- Novo Badge de Fonte ---
        const fonte = estilosFonte[qual];
        const badgeFonte = fonte ? `
            <span style="font-size: 8px; font-weight: 800; background: ${fonte.cor}; color: white; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; margin-right: 10px; opacity: 0.9;">
                ${fonte.label}
            </span>` : '';
        
        div.innerHTML = `
            <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
            <span>${item.canal || "Canal"}${plIcon}</span>
            ${badgeHtml}
            ${badgeFonte}
        `;
        
        // Mantém os eventos originais intactos
        div.onclick = () => playCanal(item, div);
        div.ondblclick = () => {
            playCanal(item, div);
            setTimeout(() => {
                const c = document.getElementById('player-container');
                if (c && !document.fullscreenElement) c.requestFullscreen();
            }, 300);
        };
        
        l.appendChild(div);
    });
};
