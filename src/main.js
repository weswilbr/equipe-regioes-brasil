// Localização na Estrutura: /src/main.js

import { loadData } from './data/store.js';
import { setInitialLanguage, applyTranslations } from './config/i18n.js';
import { initMap, updateAllMarkersOnMap } from './managers/mapManager.js';
import { setupGlobalListeners } from './utils/domListeners.js';
import { updateAllUI, switchTab, populateStatesDropdown } from './managers/uiManager.js';

/**
 * Ponto de entrada da aplicação. Orquestra a inicialização de todos os módulos.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Configurações de Idioma e Tema
    setInitialLanguage(); // Carrega o idioma do localStorage ou padrão
    applyTranslations(); // Aplica as traduções iniciais no DOM
    
    // Configura o Dark Mode
    if (localStorage.getItem('darkMode') === 'true' || 
        (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    // 2. Inicializa o Mapa (Leaflet)
    initMap();

    // 3. Carrega os Dados e Popula os Marcadores
    loadData(); // Carrega 'members' do LocalStorage
    updateAllMarkersOnMap(); // Adiciona todos os membros carregados ao mapa
    
    // 4. Configura a UI Inicial
    populateStatesDropdown(); // Preenche o dropdown de estados
    updateAllUI(); // Atualiza contadores, lista e estatísticas
    switchTab('add'); // Abre a aba de Adicionar como padrão

    // 5. Configura Event Listeners (Toda a interatividade)
    setupGlobalListeners();
    
    // 6. Esconde a tela de loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('opacity-0');
    setTimeout(() => {
         loadingOverlay.classList.add('hidden');
    }, 500);

    // Oculta a classe transition-opacity do overlay para evitar que ela interfira na animação de outros elementos.
    setTimeout(() => {
        loadingOverlay.classList.remove('transition-opacity', 'duration-500');
    }, 1000);
});
