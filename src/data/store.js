// Localização na Estrutura: /src/data/store.js

import { LOCAL_STORAGE_KEY } from '../config/config.js';
import { getTranslatedString } from '../config/i18n.js';
import { showNotification } from '../utils/notifications.js';
import { brazilStates } from './locations.js';

/**
 * Módulo de Gerenciamento de Estado (Store)
 * Controla o array de membros, a persistência e a lógica de negócios.
 */

let members = [];
let isImporting = false; // Flag para controlar o estado de importação

// --- Persistência ---

/**
 * Salva o estado atual do array de membros no LocalStorage.
 */
export function saveToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
}

/**
 * Carrega os membros do LocalStorage.
 * @returns {Array} A lista de membros carregada.
 */
export function loadData() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
        try {
            members = JSON.parse(data);
        } catch (e) {
            console.error("Erro ao carregar dados do LocalStorage:", e);
            members = [];
        }
    }
    return members;
}

// --- Leitores (Getters) ---

/**
 * Retorna uma cópia do array de membros para evitar manipulação direta.
 * @returns {Array<Object>}
 */
export function getMembers() {
    return [...members];
}

/**
 * Encontra um membro pelo ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getMemberById(id) {
    return members.find(m => m.id === id);
}

// --- Lógica de Negócios (Validação) ---

/**
 * Verifica se uma determinada região já possui um líder, excluindo um membro opcional.
 * @param {string} regionName O nome da região.
 * @param {string} [excludeId] ID do membro a ser excluído da verificação (para edições).
 * @returns {Object|undefined} O objeto do líder existente, ou undefined.
 */
function getRegionalLeader(regionName, excludeId = null) {
    return members.find(m => 
        m.isLeader && 
        m.id !== excludeId && 
        brazilStates[m.state]?.region === regionName
    );
}

// --- Modificadores (CRUD) ---

/**
 * Adiciona um novo membro à equipe.
 * @param {Object} data Dados do novo membro (name, phone, state, city, isLeader).
 * @returns {Object|null} O novo membro adicionado ou null se a regra de líder for violada.
 */
export function addMember(data) {
    const stateData = brazilStates[data.state];
    if (!stateData) return null; // Validação básica de estado

    if (data.isLeader) {
        const region = stateData.region;
        const existingLeader = getRegionalLeader(region);
        if (existingLeader) {
            showNotification(getTranslatedString('notificationRegionHasLeader', { region, leaderName: existingLeader.name }), 'warning');
            return null;
        }
    }

    const newMember = { 
        id: Date.now().toString(), // Simples ID baseado no tempo
        createdAt: new Date().toISOString(),
        ...data,
        isLeader: !!data.isLeader // Garante que é booleano
    };

    members.push(newMember);
    saveToLocalStorage();
    showNotification(getTranslatedString('notificationMemberAdded', { name: data.name }), 'success');
    return newMember;
}

/**
 * Atualiza os detalhes de um membro.
 * @param {string} id ID do membro.
 * @param {Object} details Os novos detalhes (name, phone, isLeader).
 * @returns {Object|null} O membro atualizado ou null se a regra de líder for violada.
 */
export function updateMemberDetails(id, details) {
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;

    const oldMember = members[index];
    const updatedMember = { 
        ...oldMember, 
        name: details.name.trim(),
        phone: details.phone.trim(),
        isLeader: !!details.isLeader
    };
    
    // Regra de Líder Regional
    if (updatedMember.isLeader) {
        const region = brazilStates[updatedMember.state]?.region;
        const existingLeader = getRegionalLeader(region, id);
        if (existingLeader) {
            showNotification(getTranslatedString('notificationRegionHasLeader', { region, leaderName: existingLeader.name }), 'warning');
            return null; // Falha na atualização
        }
    }

    members[index] = updatedMember;
    saveToLocalStorage();
    showNotification(getTranslatedString('notificationMemberUpdated', { name: updatedMember.name }), 'success');
    return updatedMember;
}

/**
 * Remove um membro pelo ID.
 * @param {string} id ID do membro a ser removido.
 */
export function deleteMember(id) {
    const initialLength = members.length;
    members = members.filter(m => m.id !== id);
    if (members.length < initialLength) {
        saveToLocalStorage();
        showNotification(getTranslatedString('notificationMemberRemoved'), 'success');
    }
}

/**
 * Limpa todos os membros da lista e do LocalStorage.
 */
export function clearAllMembers() {
    members = [];
    saveToLocalStorage();
    showNotification(getTranslatedString('notificationAllMembersRemoved'), 'success');
}

/**
 * Substitui os dados atuais por uma nova lista de membros (Importação).
 * @param {Array<Object>} importedMembers Lista de membros importados.
 */
export function replaceAllMembers(importedMembers) {
    isImporting = true;
    const validMembers = importedMembers.filter(m => brazilStates[m.state]);
    
    // Reinicia o ID, pois o Date.now() importado pode ser antigo
    const finalMembers = validMembers.map((m, index) => ({
        ...m,
        id: Date.now().toString() + index, // Novo ID simples para evitar conflito
        isLeader: !!m.isLeader // Garante tipo booleano
    }));
    
    members = finalMembers;
    saveToLocalStorage();
    isImporting = false;
    showNotification(getTranslatedString('notificationDataImported', { count: finalMembers.length }), 'success');
    return finalMembers;
}