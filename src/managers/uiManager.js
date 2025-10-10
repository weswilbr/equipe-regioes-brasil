// Localização na Estrutura: /src/managers/uiManager.js

import * as Store from '../data/store.js';
import * as MapManager from './mapManager.js';
import { getTranslatedString } from '../config/i18n.js';
import { showNotification } from '../utils/notifications.js';
import { brazilStates } from '../data/locations.js';
import { REGION_COLORS } from '../config/config.js';

/**
 * Módulo de Gerenciamento da Interface do Usuário (UI)
 * Controla a renderização do painel lateral, modais e estatísticas.
 */

// --- Funções de Inicialização/Atualização ---

/**
 * Atualiza todos os componentes da UI que dependem da lista de membros.
 */
export function updateAllUI() {
    updateMemberCount();
    updateMemberList();
    updateStats();
}

/**
 * Popula o dropdown de estados no formulário de adição/edição.
 */
export function populateStatesDropdown() {
    const select = document.getElementById('memberState');
    
    // Otimização: se já tiver opções (exceto a primeira), não repopula
    if (select.options.length > 1) {
         // Apenas atualiza a opção de placeholder para o idioma atual
         select.querySelector('option[value=""]').textContent = getTranslatedString('selectStateOption');
         return;
    }

    select.innerHTML = `<option value="">${getTranslatedString('selectStateOption')}</option>`;
    
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

// --- Funções da Barra de Ferramentas e Tabs ---

/**
 * Alterna entre as abas do painel lateral.
 * @param {('add'|'list'|'stats')} tabName 
 */
export function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isSelected = btn.dataset.tab === tabName;
        // Aplica/remove classes de Tailwind para o estilo de aba ativa/inativa
        btn.classList.toggle('text-indigo-600', isSelected); 
        btn.classList.toggle('dark:text-indigo-400', isSelected); 
        btn.classList.toggle('bg-indigo-50', isSelected); 
        btn.classList.toggle('dark:bg-gray-700', isSelected); 
        btn.classList.toggle('border-b-2', isSelected); 
        btn.classList.toggle('border-indigo-600', isSelected); 
        btn.classList.toggle('text-gray-600', !isSelected); 
        btn.classList.toggle('dark:text-gray-400', !isSelected);
    });
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
}

/**
 * Atualiza o contador de membros no cabeçalho.
 */
export function updateMemberCount() {
    document.getElementById('memberCount').textContent = Store.getMembers().length;
}

// --- Funções da Lista de Membros ---

/**
 * Atualiza e renderiza a lista de membros com base no termo de busca.
 */
export function updateMemberList() {
    const container = document.getElementById('memberList');
    const emptyMsg = document.getElementById('emptyMessage');
    const term = document.getElementById('searchInput').value.toLowerCase();
    
    const allMembers = Store.getMembers();

    const filtered = allMembers.filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.state.toLowerCase().includes(term) || 
        (m.city||'').toLowerCase().includes(term) || 
        (m.phone||'').includes(term)
    ).sort((a,b) => a.name.localeCompare(b.name));
    
    container.innerHTML = '';
    
    if (filtered.length === 0) { 
        emptyMsg.classList.remove('hidden'); 
        return; 
    }
    
    emptyMsg.classList.add('hidden');
    
    filtered.forEach(m => {
        const state = brazilStates[m.state];
        const leaderBadge = m.isLeader ? `<span class="text-xs font-bold text-yellow-500 dark:text-yellow-400">⭐ ${getTranslatedString('regionalLeaderBadge')}</span>` : '';
        const cleanPhone = m.phone ? m.phone.replace(/[\s\-\(\)]/g, '') : '';
        
        const card = document.createElement('div');
        card.className = `bg-gray-50 dark:bg-gray-700 rounded-lg p-4 card-hover transition-all ${m.isLeader ? 'border-2 border-yellow-400' : ''}`;
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white">${m.name}</h4>
                    ${leaderBadge}
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        📱 <a href="https://wa.me/${cleanPhone}" target="_blank" class="hover:underline">${m.phone||'-'}</a>
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        📍 ${m.city||state.name}, ${m.state}
                    </p>
                    <span class="inline-block mt-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded">${state.region}</span>
                </div>
                <div class="flex gap-1">
                    <button onclick="window.showEditMemberModal('${m.id}')" class="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-gray-600 rounded-md" title="${getTranslatedString('editButton')}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-3L20.8 7.2a2.121 2.121 0 000-3l-3-3a2.121 2.121 0 00-3 0L7 11v4h4z"></path></svg>
                    </button>
                    <button onclick="window.showConfirmDeleteModal('${m.id}', '${m.name}')" class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-600 rounded-md" title="${getTranslatedString('removeButton')}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Funções de Estatísticas ---

/**
 * Calcula e renderiza as estatísticas da equipe.
 */
export function updateStats() {
    const container = document.getElementById('statsContainer');
    const members = Store.getMembers();

    if (members.length === 0) { 
        container.innerHTML = `<div class="text-center py-8 text-gray-500"><svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><p>${getTranslatedString('emptyMemberList')}</p></div>`; 
        return; 
    }
    
    // 1. Agrupar por Região
    const byRegion = members.reduce((acc, m) => { 
        const r = brazilStates[m.state]?.region; 
        if(r) acc[r] = (acc[r] || 0) + 1; 
        return acc; 
    }, {});
    
    const sortedRegions = Object.entries(byRegion).sort((a,b) => b[1]-a[1]);
    
    // 2. Gerar HTML das Estatísticas
    container.innerHTML = 
        `<div class="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg p-4 text-white"><p class="text-sm">${getTranslatedString('reportTotalMembers')}</p><p class="text-3xl font-bold">${members.length}</p></div>` + 
        sortedRegions.map(([r,c]) => { 
            const p = (c/members.length*100).toFixed(1); 
            const color = REGION_COLORS[r];
            return `<div class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600 dark:text-gray-400">${r}</span>
                    <span class="font-semibold text-gray-900 dark:text-white">${c} (${p}%)</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div class="h-2 rounded-full" style="width:${p}%;background-color:${color.bg};"></div>
                </div>
            </div>`; 
        }).join('');
}


// --- Funções do Modal de Confirmação ---

let globalConfirmCallback = null;

/**
 * Exibe o modal genérico de confirmação.
 * @param {string} message A mensagem a ser exibida.
 * @param {function} callback A função a ser executada se o usuário confirmar.
 */
export function showConfirmModal(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.remove('hidden');
    globalConfirmCallback = callback;
}

/**
 * Esconde o modal de confirmação e limpa o callback.
 */
export function hideConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    globalConfirmCallback = null;
}

/**
 * Exibe o modal de confirmação para exclusão de um membro.
 * @param {string} memberId
 * @param {string} memberName
 */
export function showConfirmDeleteModal(memberId, memberName) {
    showConfirmModal(
        getTranslatedString('confirmDelete', { memberName }),
        () => {
            Store.deleteMember(memberId);
            MapManager.removeMarkerFromMap(memberId);
            updateAllUI();
        }
    );
}

/**
 * Executa o callback de confirmação global.
 */
export function executeConfirmCallback() {
    if (globalConfirmCallback) {
        globalConfirmCallback();
        hideConfirmModal();
    }
}


// --- Funções do Modal de Edição ---

/**
 * Exibe o modal de edição com os dados do membro.
 * @param {Object} member O objeto do membro a ser editado.
 */
export function showEditMemberModal(member) {
    const state = brazilStates[member.state];
    
    document.getElementById('editMemberId').value = member.id;
    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberPhone').value = member.phone || '';
    document.getElementById('editMemberIsLeader').checked = member.isLeader || false;

    // Localização não editável
    const locationDisplay = `<strong>${getTranslatedString('locationLabel')}:</strong> ${member.city||state.name}, ${member.state} <i>${getTranslatedString('locationNotEditable')}</i>`;
    document.getElementById('editMemberLocationDisplay').innerHTML = locationDisplay;
    
    document.getElementById('editModal').classList.remove('hidden');
}

/**
 * Esconde o modal de edição.
 */
export function hideEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

/**
 * Processa a submissão do formulário de edição.
 */
export function handleEditSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const memberId = form.editMemberId.value;
    const name = form.editMemberName.value.trim();
    const phone = form.editMemberPhone.value.trim();
    const isLeader = form.editMemberIsLeader.checked;

    if (!name) {
        showNotification(getTranslatedString('notificationErrorReport'), 'error');
        return;
    }

    const updatedMember = Store.updateMemberDetails(memberId, { name, phone, isLeader });
    
    if (updatedMember) {
        // Se a atualização foi bem-sucedida (sem violação de regra de líder)
        MapManager.updateAllMarkersOnMap(); // Recria todos os marcadores para garantir a distribuição e ícones corretos
        updateAllUI();
        hideEditModal();
    }
    // Se não for bem-sucedida, a notificação de erro já foi exibida pelo Store, e o modal permanece aberto.
}


// --- Funções de Ação Global (para botões inline) ---

// NOVO: Expondo as funções globais para os botões do HTML e Popups do Leaflet
window.showEditMemberModal = (memberId) => {
    const member = Store.getMemberById(memberId);
    if (member) showEditMemberModal(member);
};
window.showConfirmDeleteModal = showConfirmDeleteModal;