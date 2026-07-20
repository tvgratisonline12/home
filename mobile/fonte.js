// fonte.js

const estilosFonte = {
    'rd': { label: 'FONTE 1', cor: '#ef4444' },
    'eb': { label: 'FONTE 2', cor: '#3b82f6' },
    'ec': { label: 'FONTE 3', cor: '#22c55e' },
    'cx': { label: 'FONTE 4', cor: '#f59e0b' },
    'pl': { label: 'FONTE 5', cor: '#a855f7' }
};

window.renderList = function() {
    const l = document.getElementById('contentList');
    if (!l) return;
    const inputBusca = document.getElementById('filter');
    const termo = inputBusca ? inputBusca.value.toLowerCase() : "";
    
    l.innerHTML = '';
    
    const lista = canaisRaw.filter(c => {
        const matchCategoria = categoriaAtual === "Todos" || (c.categorias || []).includes(categoriaAtual);
        const matchBusca = (c.canal || "").toLowerCase().includes(termo);
        return matchCategoria && matchBusca;
    });
    
    lista.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'item';
        
        // --- LÓGICA ORIGINAL DE BADGES ---
        const qual = String(item.qualidade || "").toLowerCase();
        let badgeHtml = '';
        if (['rd', 'ad'].includes(qual)) {
            badgeHtml = '<span class="ad-badge" style="background-color:red; color:white; padding:0 4px; border-radius:3px; margin-left:5px; font-size:10px; font-weight:bold;">AD</span>';
        }
        let plIcon = '';
        if (qual === 'pl') {
            plIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-left:6px;">
                <path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 14v7H3V3h7"/>
            </svg>`;
        }
        // ---------------------------------

        // --- NOVO BADGE DE FONTE ---
        const fonte = estilosFonte[qual] || null;
        const badgeFonte = fonte ? `
            <span style="font-size: 8px; font-weight: 800; background: ${fonte.cor}; color: white; padding: 2px 6px; border-radius: 10px; text-transform: uppercase; margin-left: 10px; opacity: 0.9;">
                ${fonte.label}
            </span>` : '';
        // ---------------------------
        
        div.innerHTML = `
            <span class="channel-number">${(idx + 1).toString().padStart(2, '0')}</span>
            <span>${item.canal || "Canal"}${plIcon}</span>
            ${badgeHtml}
            ${badgeFonte}
        `;
        
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
