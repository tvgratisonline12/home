// fonte.js

// Configuração das fontes: mapeia a qualidade para o label e cores
const configuracaoFontes = {
    'rd': { label: 'FONTE 1', cor: '#e74c3c' }, // Vermelho
    'eb': { label: 'FONTE 2', cor: '#3498db' }, // Azul
    'ec': { label: 'FONTE 3', cor: '#27ae60' }, // Verde
    'cx': { label: 'FONTE 4', cor: '#f39c12' }  // Laranja
};

/**
 * Retorna o HTML do badge baseado na qualidade do canal
 * @param {string} qualidade 
 * @returns {string} HTML do badge ou string vazia
 */
function gerarBadgeFonte(qualidade) {
    const config = configuracaoFontes[qualidade.toLowerCase()];
    
    if (!config) return '';

    return `
        <span style="
            background-color: ${config.cor}; 
            color: white; 
            padding: 2px 6px; 
            border-radius: 4px; 
            margin-left: 8px; 
            font-size: 9px; 
            font-weight: bold;
            vertical-align: middle;
            text-transform: uppercase;
        ">
            ${config.label}
        </span>
    `;
}
