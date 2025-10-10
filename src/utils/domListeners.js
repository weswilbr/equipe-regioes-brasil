// Localização na Estrutura: /src/utils/domListeners.js

import * as Store from '../data/store.js';
import * as UIManager from '../managers/uiManager.js';
import * as MapManager from '../managers/mapManager.js';
import * as ReportManager from '../managers/reportManager.js';
import { getTranslatedString, setLanguage } from '../config/i18n.js';
import { showNotification } from './notifications.js';

/**
 * Módulo de Configuração de Event Listeners do DOM
 * Conecta eventos de usuário a funções de lógica de negócio e UI.
 */

/**
 * Configura todos os event listeners da aplicação.
 */
export function setupGlobalListeners() {
    
    // --- Header e Configurações Globais ---
    
    // Troca de Idioma
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        setLanguage(e.target.value);
        UIManager.populateStatesDropdown(); // Garante que o dropdown de estados seja traduzido
        UIManager.updateAllUI(); // Atualiza a lista e estatísticas traduzidas
        MapManager.updateAllMarkersOnMap(); // Atualiza popups de marcadores
    });

    // Toggle do Modo Escuro
    document.getElementById('darkModeToggle').addEventListener('click', () => { 
        document.documentElement.classList.toggle('dark'); 
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
        // Ocultado temporariamente para não sobrecarregar as notificações.
        // showNotification(`Modo ${isDark ? 'escuro' : 'claro'} ativado`, 'info'); 
    });

    // Troca de Abas
    document.querySelectorAll('.tab-btn').forEach(btn => 
        btn.addEventListener('click', () => UIManager.switchTab(btn.dataset.tab))
    );


    // --- Formulário de Adição (Add Tab) ---
    
    document.getElementById('addMemberForm').addEventListener('submit', function(e) { 
        e.preventDefault();
        
        const data = { 
            name: this.memberName.value.trim(), 
            phone: this.memberPhone.value.trim(), 
            state: this.memberState.value, 
            city: this.memberCity.value.trim(), 
            isLeader: this.memberIsLeader.checked 
        };
        
        if (!data.name || !data.state) {
            showNotification(getTranslatedString('notificationErrorReport'), 'error'); // Usando genérico
            return;
        }

        const newMember = Store.addMember(data);
        
        if (newMember) {
            MapManager.updateAllMarkersOnMap(); // Atualiza todos para redistribuição
            UIManager.updateAllUI();
            this.reset();
            document.getElementById('nameCharCount').textContent = '0/50';
        }
    });
    
    // Contador de caracteres
    document.getElementById('memberName').addEventListener('input', (e) => { 
        document.getElementById('nameCharCount').textContent = `${e.target.value.length}/50`; 
    });


    // --- Lista de Membros (List Tab) ---
    
    document.getElementById('searchInput').addEventListener('input', UIManager.updateMemberList);


    // --- Ações de Dados e Exportação ---
    
    document.getElementById('importBtn').addEventListener('click', ReportManager.startImportFlow);
    document.getElementById('jsonFileInput').addEventListener('change', (e) => { 
        const file = e.target.files[0];
        if (file) {
            ReportManager.processImportFile(file);
        }
        e.target.value = null; // Reseta para permitir o mesmo arquivo ser importado novamente
    });
    
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        UIManager.showConfirmModal(
            getTranslatedString('confirmClearAll'), 
            () => {
                Store.clearAllMembers();
                MapManager.updateAllMarkersOnMap(); // Remove todos os marcadores
                UIManager.updateAllUI();
            }
        );
    });
    
    // Botões de Exportação
    document.getElementById('exportJsonBtn').addEventListener('click', () => ReportManager.exportDataAs('json'));
    document.getElementById('exportPdfBtn').addEventListener('click', () => ReportManager.exportDataAs('pdf'));
    document.getElementById('exportXlsxBtn').addEventListener('click', () => ReportManager.exportDataAs('xlsx'));


    // --- Controles de Mapa ---
    
    document.getElementById('centerMapBtn').addEventListener('click', MapManager.centerMap);
    document.getElementById('fullscreenBtn').addEventListener('click', MapManager.toggleFullscreen);
    document.getElementById('mapTypeBtn').addEventListener('click', MapManager.toggleMapType);
    
    // Listener para o evento de tela cheia (para garantir que o Leaflet ajuste o tamanho)
    document.addEventListener('fullscreenchange', () => { 
        setTimeout(() => MapManager.map.invalidateSize(), 100); 
    });


    // --- Relatórios Regionais (PNG) ---
    
    // Note: Usamos o atributo 'id' para identificar a região
    document.getElementById('reportNorteBtn').addEventListener('click', () => ReportManager.exportRegionReport('Norte'));
    document.getElementById('reportNordesteBtn').addEventListener('click', () => ReportManager.exportRegionReport('Nordeste'));
    document.getElementById('reportCentroOesteBtn').addEventListener('click', () => ReportManager.exportRegionReport('Centro-Oeste'));
    document.getElementById('reportSudesteBtn').addEventListener('click', () => ReportManager.exportRegionReport('Sudeste'));
    document.getElementById('reportSulBtn').addEventListener('click', () => ReportManager.exportRegionReport('Sul'));


    // --- Modais de Confirmação e Edição ---
    
    // Executa o callback de Confirmação
    document.getElementById('confirmOk').addEventListener('click', (e) => { 
        e.stopPropagation(); 
        UIManager.executeConfirmCallback(); 
    });
    
    // Cancela o Modal de Confirmação
    document.getElementById('confirmCancel').addEventListener('click', (e) => { 
        e.stopPropagation(); 
        UIManager.hideConfirmModal(); 
    });

    // Cancela o Modal de Edição
    document.getElementById('editCancel').addEventListener('click', (e) => { 
        e.stopPropagation(); 
        UIManager.hideEditModal(); 
    });

    // Submissão do Modal de Edição
    document.getElementById('editMemberForm').addEventListener('submit', UIManager.handleEditSubmit);
}