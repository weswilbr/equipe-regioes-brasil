// Localização na Estrutura: /src/managers/mapManager.js

import { getMembers, getMemberById } from '../data/store.js';
import { getTranslatedString } from '../config/i18n.js';
import { showNotification } from '../utils/notifications.js';
import { MAP_TYPES, BRAZIL_CENTER_COORDS, INITIAL_MAP_ZOOM, DISTRIBUTION_RADIUS, REGION_COLORS } from '../config/config.js';
import { brazilStates } from '../data/locations.js';
import * as UIManager from './uiManager.js'; // Para interagir com modais

/**
 * Módulo de Gerenciamento do Mapa (Leaflet)
 * Controla a inicialização, marcadores, tipos de mapa e interação.
 */

let map = null;
let markerLayerGroup = null; 
const markers = {}; // Cache de marcadores Leaflet por ID

let currentMapType = 'street';
let isFullscreen = false;

// --- Funções de Ajuda ---

/**
 * Cria um ícone HTML personalizado para o Leaflet.
 * @param {string} memberName
 * @param {string} region
 * @param {boolean} isLeader
 * @returns {L.DivIcon}
 */
function createCustomIcon(memberName, region, isLeader = false) {
    const color = REGION_COLORS[region]?.bg || '#4F46E5';
    // SVG para o pino: estrela para líder, gota para membro
    const iconSvg = isLeader 
        ? `<svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="#fff" stroke-width="1.5" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>` 
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="#fff" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S11.12 7 12 7s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
        
    const html = `
        <div style="text-align:center;white-space:nowrap;display:flex;flex-direction:column;align-items:center;">
            <div style="background-color:${color};color:white;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,0.3);margin-bottom:2px;">${memberName}</div>
            ${iconSvg}
        </div>`;
        
    return L.divIcon({ 
        className: 'custom-div-icon', 
        html, 
        iconSize: [120, isLeader ? 48 : 40], 
        iconAnchor: [60, isLeader ? 46 : 38] 
    });
}

/**
 * Constrói o conteúdo HTML do popup do marcador.
 * @param {Object} member
 * @param {Object} state
 * @returns {string}
 */
function createPopupContent(member, state) {
    const leaderBadge = member.isLeader ? `<p class="text-sm font-bold text-yellow-500">⭐ ${getTranslatedString('regionalLeaderBadge')}</p>` : '';
    const cleanPhone = member.phone ? member.phone.replace(/[\s\-\(\)]/g, '') : '';
    const phone = member.phone ? `<p class="text-sm">📱 <a href="https://wa.me/${cleanPhone}" target="_blank" class="hover:underline">${member.phone}</a></p>` : '';

    // As funções de ação global agora apontam para o UIManager para abrir modais
    return `
        <div class="p-1">
            <h3 class="font-bold text-lg">${member.name}</h3>
            ${leaderBadge}
            ${phone}
            <p class="text-sm">📍 ${member.city || state.name}, ${member.state}</p>
            <div class="mt-2 flex gap-2">
                <button onclick="window.showEditMemberModal('${member.id}')" class="flex-1 bg-indigo-600 text-white text-sm py-1 px-2 rounded">${getTranslatedString('editButton')}</button>
                <button onclick="window.requestDeleteMemberFromMap('${member.id}', '${member.name}')" class="flex-1 bg-red-600 text-white text-sm py-1 px-2 rounded">${getTranslatedString('removeButton')}</button>
            </div>
        </div>
    `;
}

// --- Inicialização e Controles ---

/**
 * Inicializa o mapa Leaflet.
 */
export function initMap() {
    if (!document.getElementById('map')) return;

    map = L.map('map').setView(BRAZIL_CENTER_COORDS, INITIAL_MAP_ZOOM);
    
    // Inicializa com o tipo de mapa padrão
    const initialType = MAP_TYPES[currentMapType];
    L.tileLayer(initialType.url, { maxZoom: 18, attribution: initialType.attribution }).addTo(map);

    markerLayerGroup = L.layerGroup().addTo(map);
}

/**
 * Centraliza a visualização do mapa no Brasil.
 */
export function centerMap() {
    map.setView(BRAZIL_CENTER_COORDS, INITIAL_MAP_ZOOM);
    showNotification(getTranslatedString('notificationMapCentered'), 'info');
}

/**
 * Alterna entre os tipos de mapa (Ruas, Satélite, Terreno).
 */
export function toggleMapType() {
    const types = Object.keys(MAP_TYPES);
    const currentIndex = types.indexOf(currentMapType);
    const nextIndex = (currentIndex + 1) % types.length;
    currentMapType = types[nextIndex];
    const newType = MAP_TYPES[currentMapType];

    // Remove a camada de tile atual
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
            map.removeLayer(layer);
        }
    });

    // Adiciona a nova camada de tile
    L.tileLayer(newType.url, { maxZoom: 18, attribution: newType.attribution }).addTo(map);

    showNotification(getTranslatedString('notificationMapTypeChanged', { type: getTranslatedString(newType.nameKey) }), 'info');
}

/**
 * Ativa ou desativa o modo de tela cheia para o mapa.
 */
export function toggleFullscreen() {
    const el = document.getElementById('map').parentElement;
    
    if (!document.fullscreenElement) {
        el.requestFullscreen();
        isFullscreen = true;
    } else {
        document.exitFullscreen();
        isFullscreen = false;
    } 
    
    // A função de atualização do tamanho do mapa deve ser chamada no domListeners em fullscreenchange
    showNotification(getTranslatedString('notificationFullscreen', { status: getTranslatedString(isFullscreen ? 'statusOn' : 'statusOff') }), 'info');
}

// --- Gerenciamento de Marcadores ---

/**
 * Adiciona ou atualiza um marcador no mapa.
 * @param {Object} member
 * @param {number} lat Latitude calculada.
 * @param {number} lon Longitude calculada.
 */
export function addMarkerToMap(member, lat, lon) {
    const state = brazilStates[member.state];
    if (!state) return;

    const icon = createCustomIcon(member.name, state.region, member.isLeader);
    const popupContent = createPopupContent(member, state);

    if (markers[member.id]) {
        // Atualiza Marcador Existente (se já estiver na lista)
        const marker = markers[member.id];
        marker.setLatLng([lat, lon]);
        marker.setIcon(icon);
        marker.setPopupContent(popupContent);
        marker.setZIndexOffset(member.isLeader ? 1000 : 0);
    } else {
        // Adiciona Novo Marcador
        const marker = L.marker([lat, lon], { icon, zIndexOffset: member.isLeader ? 1000 : 0 });
        marker.bindPopup(popupContent);
        markerLayerGroup.addLayer(marker); 
        markers[member.id] = marker;
    }
}

/**
 * Remove um marcador do mapa pelo ID.
 * @param {string} memberId
 */
export function removeMarkerFromMap(memberId) {
    if (markers[memberId]) {
        markerLayerGroup.removeLayer(markers[memberId]);
        delete markers[memberId];
    }
}

/**
 * Limpa todos os marcadores e os recria com base nos dados do Store.
 * Implementa a lógica de distribuição circular para evitar sobreposição.
 */
export function updateAllMarkersOnMap() {
    // 1. Limpa marcadores existentes no mapa
    markerLayerGroup.clearLayers();
    
    // 2. Re-adiciona/re-cria os marcadores
    const membersList = getMembers();
    
    // 2.1 Agrupa membros por estado
    const membersByState = membersList.reduce((acc, member) => { 
        (acc[member.state] = acc[member.state] || []).push(member); 
        return acc; 
    }, {});
    
    // 2.2 Itera sobre os estados para calcular posições
    for (const stateCode in membersByState) {
        const stateMembers = membersByState[stateCode];
        const stateData = brazilStates[stateCode];
        const totalInState = stateMembers.length;

        stateMembers.forEach((member, index) => {
            let lat, lon;
            
            // Lógica de Distribuição Circular (Spiderfy manual)
            if (totalInState > 1) { 
                const angle = (360 / totalInState) * index;
                const radians = angle * (Math.PI / 180);
                // Calcula as novas coordenadas no círculo. Ajuste a magnitude para que a dispersão não seja muito grande.
                const dispersalFactor = DISTRIBUTION_RADIUS * 0.001 * INITIAL_MAP_ZOOM; 
                lat = stateData.lat + dispersalFactor * Math.cos(radians); 
                lon = stateData.lon + dispersalFactor * Math.sin(radians);
            } else { 
                // Apenas um membro no estado, usa a coordenada central
                lat = stateData.lat; 
                lon = stateData.lon; 
            }
            
            // Adiciona/Atualiza o marcador
            addMarkerToMap(member, lat, lon);
        });
    }
}


// --- Funções de Ação Global (para o popup do mapa) ---

// NOVO: Adiciona função global para ser chamada pelo HTML do Leaflet popup
window.requestDeleteMemberFromMap = function(memberId, memberName) {
    map.closePopup();
    UIManager.showConfirmDeleteModal(memberId, memberName);
}

// NOVO: Adiciona função global para ser chamada pelo HTML do Leaflet popup
window.showEditMemberModal = function(memberId) {
    map.closePopup(); 
    const member = getMemberById(memberId);
    if (member) {
        UIManager.showEditMemberModal(member);
    } else {
         showNotification(getTranslatedString('notificationErrorReport'), 'error');
    }
}