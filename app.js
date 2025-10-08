// ========================
// Configurações e Estado
// ========================

let map = null;
let markerClusterGroup = null;
const markers = {};
let members = [];
let currentMapType = 'street';
let isFullscreen = false;
let confirmCallback = null;

// Coordenadas dos estados brasileiros
const brazilStates = {
    'AC': { name: 'Acre', lat: -9.0238, lon: -70.812, region: 'Norte' },
    'AL': { name: 'Alagoas', lat: -9.5713, lon: -36.782, region: 'Nordeste' },
    'AP': { name: 'Amapá', lat: 1.4132, lon: -51.7661, region: 'Norte' },
    'AM': { name: 'Amazonas', lat: -3.4168, lon: -65.8561, region: 'Norte' },
    'BA': { name: 'Bahia', lat: -12.9714, lon: -38.5014, region: 'Nordeste' },
    'CE': { name: 'Ceará', lat: -3.7172, lon: -38.5431, region: 'Nordeste' },
    'DF': { name: 'Distrito Federal', lat: -15.7797, lon: -47.9297, region: 'Centro-Oeste' },
    'ES': { name: 'Espírito Santo', lat: -20.3155, lon: -40.3128, region: 'Sudeste' },
    'GO': { name: 'Goiás', lat: -16.6869, lon: -49.2648, region: 'Centro-Oeste' },
    'MA': { name: 'Maranhão', lat: -2.5387, lon: -44.2827, region: 'Nordeste' },
    'MT': { name: 'Mato Grosso', lat: -15.601, lon: -56.0979, region: 'Centro-Oeste' },
    'MS': { name: 'Mato Grosso do Sul', lat: -20.4697, lon: -54.6201, region: 'Centro-Oeste' },
    'MG': { name: 'Minas Gerais', lat: -19.9167, lon: -43.9345, region: 'Sudeste' },
    'PA': { name: 'Pará', lat: -1.4558, lon: -48.5039, region: 'Norte' },
    'PB': { name: 'Paraíba', lat: -7.1195, lon: -34.8451, region: 'Nordeste' },
    'PR': { name: 'Paraná', lat: -25.4284, lon: -49.2733, region: 'Sul' },
    'PE': { name: 'Pernambuco', lat: -8.0476, lon: -34.8771, region: 'Nordeste' },
    'PI': { name: 'Piauí', lat: -5.0919, lon: -42.8038, region: 'Nordeste' },
    'RJ': { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, region: 'Sudeste' },
    'RN': { name: 'Rio Grande do Norte', lat: -5.7945, lon: -35.211, region: 'Nordeste' },
    'RS': { name: 'Rio Grande do Sul', lat: -30.0346, lon: -51.2177, region: 'Sul' },
    'RO': { name: 'Rondônia', lat: -8.7619, lon: -63.9039, region: 'Norte' },
    'RR': { name: 'Roraima', lat: 2.8235, lon: -60.6758, region: 'Norte' },
    'SC': { name: 'Santa Catarina', lat: -27.5954, lon: -48.5482, region: 'Sul' },
    'SP': { name: 'São Paulo', lat: -23.5505, lon: -46.6333, region: 'Sudeste' },
    'SE': { name: 'Sergipe', lat: -10.9472, lon: -37.0731, region: 'Nordeste' },
    'TO': { name: 'Tocantins', lat: -10.1689, lon: -48.3317, region: 'Norte' }
};

// Tipos de mapa
const mapTiles = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
};

// Cores das regiões
const regionColors = {
    'Norte': { bg: '#10b981', text: '#065f46', light: '#d1fae5' },
    'Nordeste': { bg: '#f59e0b', text: '#92400e', light: '#fef3c7' },
    'Centro-Oeste': { bg: '#f97316', text: '#9a3412', light: '#ffedd5' },
    'Sudeste': { bg: '#3b82f6', text: '#1e3a8a', light: '#dbeafe' },
    'Sul': { bg: '#8b5cf6', text: '#5b21b6', light: '#ede9fe' }
};

// ========================
// Local Storage Management
// ========================

// Chave do Local Storage (Genérico)
const localStorageKey = 'plataformaEquipe_members';

function saveToLocalStorage() {
    localStorage.setItem(localStorageKey, JSON.stringify(members));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem(localStorageKey);
    if (data) {
        members = JSON.parse(data);
        members.forEach(member => addMarkerToMap(member));
        updateMemberList();
        updateStats();
        updateMemberCount();
    }
}

// ========================
// Funções de Notificação
// ========================

function showNotification(message, type = 'success') {
    const backgroundColor = {
        success: 'linear-gradient(to right, #10b981, #059669)',
        error: 'linear-gradient(to right, #ef4444, #dc2626)',
        warning: 'linear-gradient(to right, #f59e0b, #d97706)',
        info: 'linear-gradient(to right, #3b82f6, #2563eb)'
    };

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: backgroundColor[type] || backgroundColor.info,
        },
        stopOnFocus: true,
    }).showToast();
}

// ========================
// Funções do Modal de Confirmação e Edição
// ========================

function showConfirmModal(message, callback) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    
    messageEl.textContent = message;
    modal.classList.remove('hidden');
    confirmCallback = callback;
}

function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
    confirmCallback = null;
}

// Funções globais para serem chamadas do HTML do Leaflet Popup e da Lista
window.deleteMemberFromPopup = function(memberId) {
     const member = members.find(m => m.id === memberId);
     if (member) {
         showConfirmModal(`Tem certeza que deseja remover o membro "${member.name}"?`, () => {
             deleteMember(memberId);
             map.closePopup(); // Fechar o popup após confirmação
         });
     }
}

window.requestDeleteMember = function(memberId, memberName) {
    showConfirmModal(`Tem certeza que deseja remover o membro "${memberName}"?`, () => {
        deleteMember(memberId);
    });
}

// Funções de Modal de Edição
window.showEditMemberModal = function(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) {
        showNotification('Membro não encontrado para edição.', 'error');
        return;
    }
    
    const state = brazilStates[member.state];
    
    document.getElementById('editMemberId').value = member.id;
    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberPhone').value = member.phone || ''; 

    document.getElementById('editMemberLocationDisplay').innerHTML = `
        Localização (não editável): <strong>${member.city || state.name}, ${member.state} (${state.region})</strong>
    `;

    document.getElementById('editModal').classList.remove('hidden');
}

function hideEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

// NOVO: Função para solicitar edição a partir do mapa
window.requestEditMemberFromMap = function(memberId) {
    // Fecha o popup do Leaflet antes de abrir o modal
    map.closePopup(); 
    // Reutiliza a função que abre o modal de edição
    window.showEditMemberModal(memberId); 
}

// ========================
// Inicialização do Mapa
// ========================

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error("Elemento '#map' não encontrado.");
        return;
    }

    map = L.map('map').setView([-15.7797, -47.9297], 4);

    L.tileLayer(mapTiles[currentMapType], {
        maxZoom: 18,
        attribution: (currentMapType === 'satellite' ? 'Tiles © Esri' : '© OpenStreetMap contributors') 
    }).addTo(map);

    markerClusterGroup = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    
    map.addLayer(markerClusterGroup);
}

// ========================
// Funções de Mapa
// ========================

// Função para criar um ícone personalizado com o nome do membro
function createCustomIcon(memberName, region) {
    const regionColor = regionColors[region]?.bg || '#4F46E5'; 
    
    const htmlContent = `
        <div style="
            text-align: center;
            white-space: nowrap;
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: none; 
        ">
            <div style="
                background-color: ${regionColor};
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
                margin-bottom: 2px;
                line-height: 1;
                max-width: 120px;
                overflow: hidden;
                text-overflow: ellipsis;
                pointer-events: none;
            ">
                ${memberName}
            </div>
            <!-- Pino com formato de gota -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="${regionColor}" stroke="#ffffff" stroke-width="1.5" style="display: block; position: relative; top: -2px; pointer-events: auto;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
        </div>
    `;

    return L.divIcon({
        className: 'custom-div-icon', 
        html: htmlContent,
        iconSize: [120, 40], 
        iconAnchor: [60, 40]
    });
}

function addMarkerToMap(member) {
    const state = brazilStates[member.state];
    if (!state) {
         console.warn(`Estado ${member.state} não encontrado nas coordenadas de mapeamento.`);
         return;
    }

    // 1. Cria o ícone personalizado com o nome e cor da região
    const customIcon = createCustomIcon(member.name, state.region); 

    const marker = L.marker([state.lat, state.lon], {
        title: member.name,
        icon: customIcon // Usa o ícone personalizado
    });

    // Conteúdo do Popup: Adiciona o botão de edição
    // NOVO: Adiciona link para WhatsApp
    const cleanPhone = member.phone ? member.phone.replace(/[\s\-\(\)]/g, '') : '';
    const phoneLink = member.phone ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">📱 <a href="https://wa.me/${cleanPhone}" target="_blank" class="hover:underline">${member.phone}</a></p>` : '';
    
    const popupContent = `
        <div class="p-2">
            <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">${member.name}</h3>
            ${phoneLink}
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">📍 ${member.city || state.name}, ${member.state}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">🌎 Região ${state.region}</p>
            
            <div class="mt-3 flex gap-2">
                <!-- Botão de Edição (NOVO) -->
                <button 
                    onclick="window.requestEditMemberFromMap('${member.id}')" 
                    class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1 px-2 rounded transition-colors">
                    Editar
                </button>
                <!-- Botão de Remoção -->
                <button 
                    onclick="window.deleteMemberFromPopup('${member.id}')" 
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-2 rounded transition-colors">
                    Remover
                </button>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);
    markerClusterGroup.addLayer(marker);
    markers[member.id] = marker;
}

function removeMarkerFromMap(memberId) {
    if (markers[memberId]) {
        markerClusterGroup.removeLayer(markers[memberId]);
        delete markers[memberId];
    }
}

function centerMap() {
    map.setView([-15.7797, -47.9297], 4);
    showNotification('Mapa centralizado no Brasil', 'info');
}

function toggleMapType() {
    const types = Object.keys(mapTiles);
    const currentIndex = types.indexOf(currentMapType);
    const nextIndex = (currentIndex + 1) % types.length;
    currentMapType = types[nextIndex];

    // Remove a camada de tile atual
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
            map.removeLayer(layer);
        }
    });

    // Adiciona a nova camada de tile
    const newAttribution = (currentMapType === 'satellite' ? 'Tiles © Esri' : (currentMapType === 'terrain' ? 'Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap (CC-BY-SA)' : '© OpenStreetMap contributors'));
    
    L.tileLayer(mapTiles[currentMapType], {
        maxZoom: 18,
        attribution: newAttribution
    }).addTo(map);

    const typeNames = {
        street: 'Ruas',
        satellite: 'Satélite',
        terrain: 'Terreno'
    };

    showNotification(`Tipo de mapa alterado para: ${typeNames[currentMapType]}`, 'info');
}

function toggleFullscreen() {
    const mapContainer = document.getElementById('map').parentElement;
    
    if (!isFullscreen) {
        // Entra em tela cheia
        if (mapContainer.requestFullscreen) {
            mapContainer.requestFullscreen();
        } else if (mapContainer.webkitRequestFullscreen) {
            mapContainer.webkitRequestFullscreen();
        } else if (mapContainer.msRequestFullscreen) {
            mapContainer.msRequestFullscreen();
        }
        isFullscreen = true;
        showNotification('Modo Tela Cheia ativado', 'info');
    } else {
        // Sai de tela cheia
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen = false;
        showNotification('Modo Tela Cheia desativado', 'info');
    }

    // Invalida o tamanho do mapa para garantir que ele se ajuste corretamente
    setTimeout(() => map.invalidateSize(), 100);
}

// ========================
// Funções de Estados
// ========================

function populateStatesDropdown() {
    const select = document.getElementById('memberState');
    
    // Ordena os estados alfabeticamente pelo nome
    const sortedStates = Object.entries(brazilStates)
        .sort((a, b) => a[1].name.localeCompare(b[1].name));

    sortedStates.forEach(([code, data]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${data.name} (${code})`;
        select.appendChild(option);
    });
}

// ========================
// CRUD de Membros
// ========================

function addMember(memberData) {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    const newMember = {
        id: Date.now().toString(),
        name: memberData.name,
        phone: memberData.phone,
        state: memberData.state,
        city: memberData.city,
        createdAt: new Date().toISOString()
    };

    members.push(newMember);
    saveToLocalStorage();
    addMarkerToMap(newMember);
    updateMemberList();
    updateStats();
    updateMemberCount();
    
    console.log('Membro Adicionado:', newMember);

    showNotification(`${memberData.name} adicionado com sucesso!`, 'success');
    document.getElementById('addMemberForm').reset();
    document.getElementById('nameCharCount').textContent = '0/50';
    
    submitBtn.disabled = false;
}

function updateMemberDetails(memberId, newDetails) {
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
        // Atualiza apenas nome e phone
        members[index] = {
            ...members[index],
            name: newDetails.name,
            phone: newDetails.phone
        };
        const updatedMember = members[index];
        
        saveToLocalStorage();
        updateMemberList();
        updateStats();

        // ** Atualiza o Marcador no Mapa **
        removeMarkerFromMap(memberId);
        addMarkerToMap(updatedMember);
        // ** FIM ATUALIZAÇÃO **
        
        showNotification(`Membro "${newDetails.name}" atualizado com sucesso!`, 'success');
    }
}


function deleteMember(memberId) {
    members = members.filter(m => m.id !== memberId);
    saveToLocalStorage();
    removeMarkerFromMap(memberId);
    updateMemberList();
    updateStats();
    updateMemberCount();
    showNotification('Membro removido com sucesso!', 'success');
}

function clearAllMembers() {
     showConfirmModal('Você tem certeza que deseja remover TODOS os membros? Esta ação é irreversível.', () => {
        Object.keys(markers).forEach(id => removeMarkerFromMap(id));
        members = [];
        saveToLocalStorage();
        updateMemberList();
        updateStats();
        updateMemberCount();
        showNotification('Todos os membros foram removidos!', 'success');
        hideConfirmModal();
    });
}

// ========================
// Funções de Importação/Exportação
// ========================

function importData(jsonContent) {
    try {
        const importedMembers = JSON.parse(jsonContent);
        if (!Array.isArray(importedMembers)) {
            throw new Error("O arquivo não contém uma lista de membros válida.");
        }

        // Limpar dados existentes (opcional, mas recomendado para importação)
        clearAllMembers();
        
        // Adicionar os novos membros
        importedMembers.forEach(member => {
             // Adiciona campos de controle de forma segura
            if (!member.id) member.id = Date.now().toString() + Math.random().toString(36).substring(2, 9); 
            if (!member.state || !brazilStates[member.state]) {
                console.warn(`Membro ignorado: Estado inválido para ${member.name}`);
                return; 
            }
            members.push(member);
            addMarkerToMap(member);
        });

        saveToLocalStorage();
        updateMemberList();
        updateStats();
        updateMemberCount();
        showNotification(`${importedMembers.length} membros importados com sucesso!`, 'success');

    } catch (error) {
        console.error("Erro ao importar JSON:", error);
        showNotification(`Erro na importação: ${error.message || 'Formato de arquivo inválido.'}`, 'error');
    }
}


// ========================
// Funções da Interface e UI
// ========================

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const btnTab = btn.getAttribute('data-tab');
        // Remove e adiciona classes de estilo do tab
        if (btnTab === tabName) {
            btn.classList.add('text-indigo-600', 'dark:text-indigo-400', 'bg-indigo-50', 'dark:bg-gray-700', 'border-b-2', 'border-indigo-600', 'dark:border-indigo-400');
            btn.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white');
        } else {
            btn.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'bg-indigo-50', 'dark:bg-gray-700', 'border-b-2', 'border-indigo-600', 'dark:border-indigo-400');
            btn.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white');
        }
    });

    // Esconde e mostra o conteúdo do tab
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const tabMap = {
        add: 'addTab',
        list: 'listTab',
        stats: 'statsTab'
    };

    document.getElementById(tabMap[tabName]).classList.remove('hidden');
}

function updateMemberList() {
    const listContainer = document.getElementById('memberList');
    const emptyMessage = document.getElementById('emptyMessage');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    // Filtra os membros
    const filteredMembers = members.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        (member.phone && member.phone.toLowerCase().includes(searchTerm)) || // Busca por telefone
        member.state.toLowerCase().includes(searchTerm) ||
        (member.city && member.city.toLowerCase().includes(searchTerm))
    );
    
    // Ordena por nome
    filteredMembers.sort((a, b) => a.name.localeCompare(b.name));

    if (filteredMembers.length === 0) {
        emptyMessage.classList.remove('hidden');
        listContainer.innerHTML = '';
        listContainer.appendChild(emptyMessage);
        return;
    }

    emptyMessage.classList.add('hidden');
    listContainer.innerHTML = '';

    filteredMembers.forEach(member => {
        const state = brazilStates[member.state];
        const cleanPhone = member.phone ? member.phone.replace(/[\s\-\(\)]/g, '') : '';
        const phoneLink = member.phone ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">📱 <a href="https://wa.me/${cleanPhone}" target="_blank" class="hover:underline">${member.phone}</a></p>` : '';
        
        const memberCard = document.createElement('div');
        memberCard.className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 card-hover transition-all animate-fade-in';
        memberCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white">${member.name}</h4>
                    ${phoneLink}
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        📍 ${member.city || state.name}, ${member.state}
                    </p>
                    <span class="inline-block mt-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded">
                        ${state.region}
                    </span>
                </div>
                <div class="flex gap-1 ml-2">
                    <!-- BOTÃO DE EDIÇÃO -->
                    <button 
                        onclick="window.showEditMemberModal('${member.id}')"
                        class="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-md transition-colors"
                        title="Editar membro">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-3L20.8 7.2a2.121 2.121 0 000-3l-3-3a2.121 2.121 0 00-3 0L7 11v4h4z"></path>
                        </svg>
                    </button>
                    <button 
                        onclick="window.requestDeleteMember('${member.id}', '${member.name}')"
                        class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
                        title="Remover membro">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        listContainer.appendChild(memberCard);
    });
}

function updateStats() {
    const statsContainer = document.getElementById('statsContainer');

    if (members.length === 0) {
        statsContainer.innerHTML = `
            <div class="text-center py-8">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p class="text-gray-500 dark:text-gray-400">Adicione membros para ver estatísticas</p>
            </div>
        `;
        return;
    }

    const byRegion = {};
    const byState = {};

    members.forEach(member => {
        const state = brazilStates[member.state];
        if (state) {
            byRegion[state.region] = (byRegion[state.region] || 0) + 1;
            byState[member.state] = (byState[member.state] || 0) + 1;
        }
    });

    const sortedRegions = Object.entries(byRegion).sort((a, b) => b[1] - a[1]);
    const sortedStates = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 5);

    statsContainer.innerHTML = `
        <div class="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg p-4 text-white shadow-xl">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm opacity-90">Total de Membros</p>
                    <p class="text-3xl font-bold mt-1">${members.length}</p>
                </div>
                <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Distribuição por Região</h3>
            <div class="space-y-3">
                ${sortedRegions.map(([region, count]) => {
                    const percentage = (count / members.length * 100).toFixed(1);
                    const regionColor = regionColors[region] || { bg: '#9ca3af', text: '#374151' };
                    return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-600 dark:text-gray-400">${region}</span>
                                <span class="font-semibold text-gray-900 dark:text-white">${count} (${percentage}%)</span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div class="h-2 rounded-full" style="width: ${percentage}%; background-color: ${regionColor.bg};"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Top 5 Estados em Membros</h3>
                <div class="space-y-3">
                    ${sortedStates.map(([stateCode, count], index) => {
                        const state = brazilStates[stateCode];
                        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                        return `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span class="text-xl">${medals[index]}</span>
                                    <span class="text-sm text-gray-900 dark:text-white font-medium">${state.name} (${stateCode})</span>
                                </div>
                                <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded font-semibold">
                                    ${count}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    function updateMemberCount() {
        document.getElementById('memberCount').textContent = members.length;
    }

    function exportData() {
        if (members.length === 0) {
            showNotification('Não há dados para exportar', 'warning');
            return;
        }

        const dataStr = JSON.stringify(members, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        // Nome do arquivo de exportação
        link.download = `equipe-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showNotification('Dados exportados com sucesso!', 'success');
    }
    
    // FUNÇÃO PARA IMPORTAR DADOS JSON
    function handleImport() {
        document.getElementById('jsonFileInput').click();
    }
    
    document.getElementById('jsonFileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            importData(event.target.result);
        };
        reader.onerror = function() {
            showNotification('Erro ao ler o arquivo.', 'error');
        };
        reader.readAsText(file);
        // Resetar o input para que o evento 'change' dispare novamente se o mesmo arquivo for selecionado
        e.target.value = null; 
    });


    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
        showNotification(`Modo ${isDark ? 'escuro' : 'claro'} ativado`, 'info');
    }

// ========================
// EXPORTAÇÃO DE RELATÓRIOS POR REGIÃO EM PNG (Aprimorado)
// ========================

async function exportRegionReport(regionName) {
    const regionMembers = members.filter(m => brazilStates[m.state]?.region === regionName);
    
    if (regionMembers.length === 0) {
        showNotification(`Não há membros na região ${regionName}`, 'warning');
        return;
    }

    showNotification(`Gerando relatório da região ${regionName}...`, 'info');

    // Criar HTML do relatório
    const reportHTML = generateRegionReportHTML(regionName, regionMembers);
    
    // Inserir no container invisível
    const container = document.getElementById('reportContainer');
    container.innerHTML = reportHTML;

    // Aguardar um pouco para renderização do CSS (ajuda na captura)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capturar como PNG
    try {
        // Temporariamente torna o container visível (mas fora da tela) para o html2canvas
        container.style.position = 'relative';
        container.style.left = '0';
        
        const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 2, // Aumenta a escala para melhor qualidade de imagem
            logging: false,
            width: 1200, // Largura fixa para o relatório
            windowWidth: 1200
        });

        // Devolve o container ao estado invisível
        container.style.position = 'absolute';
        container.style.left = '-9999px';


        // Converter para blob e baixar
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Nome do arquivo de exportação
            link.download = `relatorio-equipe-${regionName.toLowerCase().replace('-', '')}-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showNotification(`Relatório da região ${regionName} exportado com sucesso!`, 'success');
        }, 'image/png'); // Tipo de imagem
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showNotification('Erro ao gerar relatório. Verifique o console para detalhes.', 'error');
    } finally {
        container.innerHTML = '';
    }
}

// FUNÇÃO DE GERAÇÃO DE RELATÓRIO COM NOMES
function generateRegionReportHTML(regionName, regionMembers) {
    const regionColor = regionColors[regionName];
    
    // Estatísticas da região
    const byState = {};
    
    regionMembers.forEach(m => {
        byState[m.state] = (byState[m.state] || 0) + 1;
    });

    const sortedStates = Object.entries(byState).sort((a, b) => b[1] - a[1]);
    const sortedMembers = regionMembers.sort((a, b) => a.name.localeCompare(b.name));
    const totalMembers = regionMembers.length;
    const today = new Date().toLocaleDateString('pt-BR');

    // Ícones das regiões
    const regionIcons = {
        'Norte': '🌳',
        'Nordeste': '☀️',
        'Centro-Oeste': '🌾',
        'Sudeste': '🏙️',
        'Sul': '❄️'
    };

    return `
        <div style="font-family: 'Inter', sans-serif; padding: 40px; background: white; width: 1200px; box-sizing: border-box;">
            <!-- Cabeçalho do Relatório -->
            <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid ${regionColor.bg};">
                <div style="font-size: 60px; margin-bottom: 10px;">${regionIcons[regionName]}</div>
                <h1 style="color: ${regionColor.text}; font-size: 42px; font-weight: 800; margin: 0 0 10px 0;">
                    Relatório - Região ${regionName}
                </h1>
                <p style="color: #6b7280; font-size: 18px; margin: 0;">Análise da Plataforma da Equipe em ${regionName} | Data: ${today}</p>
            </div>

            <!-- Métricas Principais -->
            <div style="display: flex; justify-content: space-around; gap: 30px; margin-bottom: 40px;">
                <div style="flex: 1; text-align: center; padding: 20px; background: ${regionColor.light}; border-radius: 8px;">
                    <p style="color: ${regionColor.text}; font-size: 16px; margin: 0;">Total de Membros</p>
                    <p style="font-size: 48px; font-weight: 800; color: ${regionColor.text}; margin: 10px 0 0 0;">${totalMembers}</p>
                </div>
                <div style="flex: 1; text-align: center; padding: 20px; background: ${regionColor.light}; border-radius: 8px;">
                    <p style="color: ${regionColor.text}; font-size: 16px; margin: 0;">Estados Ativos</p>
                    <p style="font-size: 48px; font-weight: 800; color: ${regionColor.text}; margin: 10px 0 0 0;">${sortedStates.length}</p>
                </div>
            </div>

            <div style="display: flex; gap: 40px;">
                <!-- Distribuição por Estado -->
                <div style="flex: 1; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px;">Distribuição por Estado</h2>
                    ${sortedStates.map(([stateCode, count]) => {
                        const stateName = brazilStates[stateCode].name;
                        const percentage = (count / totalMembers * 100).toFixed(1);
                        return `
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 4px;">
                                    <span style="color: #4b5563;">${stateName} (${stateCode})</span>
                                    <span style="font-weight: 600; color: #1f2937;">${count} (${percentage}%)</span>
                                </div>
                                <div style="width: 100%; background: #e5e7eb; border-radius: 4px; height: 8px;">
                                    <div style="height: 8px; border-radius: 4px; background-color: ${regionColor.bg}; width: ${percentage}%;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Lista de Membros por Nome -->
                <div style="flex: 1; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px;">Lista de Membros (${totalMembers} Total)</h2>
                    <ul style="list-style-type: none; padding: 0;">
                        ${sortedMembers.map(m => `
                            <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 16px; color: #1f2937;">
                                <strong>${m.name}</strong> - 
                                ${m.city ? `${m.city}, ` : ''}${m.state} 
                                ${m.phone ? ` (<a href="https://wa.me/${m.phone.replace(/[\s\-\(\)]/g, '')}">${m.phone}</a>)` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>

            <!-- Rodapé do Relatório -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #9ca3af;">
                Relatório Gerado pela Plataforma da Equipe em ${today}
            </div>
        </div>
    `;
}


// ========================
// Event Listeners e Inicialização
// ========================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o mapa
    initMap();
    
    // 2. Carrega os dados
    loadFromLocalStorage();
    
    // 3. Popula o dropdown de estados
    populateStatesDropdown();

    // 4. Configura o Modo Escuro
    if (localStorage.getItem('darkMode') === 'true' || 
        (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // 5. Adiciona Listeners de Evento
    
    // FECHAMENTO DE MODAL AO CLICAR NO BACKDROP
    document.getElementById('confirmModal').addEventListener('click', hideConfirmModal);
    document.getElementById('editModal').addEventListener('click', hideEditModal);


    // Toggle do Modo Escuro
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Troca de Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Previne propagação de clique no tab
            switchTab(btn.getAttribute('data-tab'));
        });
    });

    // Adicionar Membro
    document.getElementById('addMemberForm').addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const memberName = this.memberName.value.trim();
        const memberPhone = this.memberPhone.value.trim(); 
        const memberState = this.memberState.value;
        const memberCity = this.memberCity.value.trim();

        // Validação mínima
        if (!memberName || !memberState) {
            showNotification('Nome e Estado são obrigatórios.', 'error');
            return;
        }

        addMember({
            name: memberName,
            phone: memberPhone,
            state: memberState,
            city: memberCity
        });
    });
    
    // Contador de caracteres para o nome
    document.getElementById('memberName').addEventListener('input', (e) => {
        const count = e.target.value.length;
        document.getElementById('nameCharCount').textContent = `${count}/50`;
    });

    // Busca na Lista
    document.getElementById('searchInput').addEventListener('input', updateMemberList);
    
    // Botão de Importação JSON
    document.getElementById('importBtn').addEventListener('click', (e) => { 
        e.stopPropagation();
        handleImport(); 
    });

    // Ações Rápidas (Globais)
    document.getElementById('centerMapBtn').addEventListener('click', (e) => { e.stopPropagation(); centerMap(); });
    document.getElementById('clearAllBtn').addEventListener('click', (e) => { e.stopPropagation(); clearAllMembers(); });
    document.getElementById('exportBtn').addEventListener('click', (e) => { e.stopPropagation(); exportData(); });
    document.getElementById('fullscreenBtn').addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(); });
    document.getElementById('mapTypeBtn').addEventListener('click', (e) => { e.stopPropagation(); toggleMapType(); });
    
    // Listeners do Modal de Confirmação
    document.getElementById('confirmOk').addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof confirmCallback === 'function') { // Verifica se é uma função antes de executar
            confirmCallback();
        }
        hideConfirmModal();
    });
    document.getElementById('confirmCancel').addEventListener('click', (e) => { e.stopPropagation(); hideConfirmModal(); });
    
    // Listeners do Modal de Edição (CORRIGIDO VIA SUBMIT)
    document.getElementById('editCancel').addEventListener('click', (e) => { e.stopPropagation(); hideEditModal(); });

    document.getElementById('editMemberForm').addEventListener('submit', function(e) {
        e.preventDefault(); // IMPEDE O COMPORTAMENTO PADRÃO
        e.stopPropagation(); // CORREÇÃO CRUCIAL: Previne a propagação
        
        // LOG DE DEBUG PARA CONFIRMAR QUE O HANDLER ESTÁ SENDO EXECUTADO
        console.log('--- FORMULÁRIO DE EDIÇÃO SUBMETIDO ---');
        
        const memberId = document.getElementById('editMemberId').value;
        const newName = document.getElementById('editMemberName').value.trim();
        const newPhone = document.getElementById('editMemberPhone').value.trim(); 

        if (!newName) {
            showNotification('O nome não pode ficar vazio.', 'error');
            return;
        }

        // CHAMA A FUNÇÃO DE SALVAMENTO
        updateMemberDetails(memberId, { name: newName, phone: newPhone }); 
        hideEditModal();
    });
    
    // Listener para o evento de sair/entrar em tela cheia via ESC ou outro método
    document.addEventListener('fullscreenchange', () => {
        isFullscreen = !!document.fullscreenElement;
        map.invalidateSize();
    });

    // 6. Esconde a tela de loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('opacity-0', 'transition-opacity', 'duration-500');
    setTimeout(() => {
         loadingOverlay.classList.add('hidden');
    }, 500);
});