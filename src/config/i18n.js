// Localização na Estrutura: /src/config/i18n.js (CORRIGIDO)

/**
 * Módulo de Internacionalização (I18N)
 * Contém o objeto de tradução e as funções para gerenciar o idioma.
 */

const translations = {
    pt: {
        appTitle: "Plataforma da Equipe", appDescription: "Plataforma interativa para visualização e gerenciamento de membros da equipe.", loadingApp: "Carregando aplicação...", headerTitle: "Plataforma da Equipe", headerSubtitle: "Localize membros em todo o Brasil", membersCountLabel: "membros", addTab: "Adicionar", listTab: "Lista", statsTab: "Estatísticas", addNewMemberTitle: "Adicionar Novo Membro", nameLabel: "Nome do Membro", namePlaceholder: "Ex: João da Silva", phoneLabel: "Telefone/WhatsApp", phonePlaceholder: "Ex: (99) 99999-9999", stateLabel: "Estado", selectStateOption: "Selecione um estado", cityLabel: "Cidade", cityPlaceholder: "Ex: São Paulo", regionalLeaderLabel: "Responsável pela Região", addMemberButton: "Adicionar Membro", teamMembersTitle: "Membros da Equipe", searchPlaceholder: "Buscar membro...", emptyMemberList: "Nenhum membro adicionado ainda.", teamStatsTitle: "Estatísticas da Equipe", teamDataTitle: "Dados da Equipe", importJsonButton: "Importar JSON", clearAllButton: "Limpar Tudo", exportListTitle: "Exportar Lista de Membros", regionalReportsTitle: "Relatórios por Região (PNG)", confirmActionTitle: "Confirmar Ação", cancelButton: "Cancelar", confirmButton: "Confirmar", editMemberTitle: "Editar Membro", saveChangesButton: "Salvar Alterações", locationLabel: "Localização", locationNotEditable: "(não editável)", regionalLeaderBadge: "Responsável Regional", regionLabel: "Região", editButton: "Editar", removeButton: "Remover", mapTypeStreet: "Ruas", mapTypeSatellite: "Satélite", mapTypeTerrain: "Terreno", toggleDarkModeTooltip: "Alternar modo escuro", exportJsonTooltip: "Exportar para JSON", exportPdfTooltip: "Exportar para PDF", exportXlsxTooltip: "Exportar para Excel", centerMapTooltip: "Centralizar Mapa", fullscreenTooltip: "Tela Cheia", mapTypeTooltip: "Alterar Tipo de Mapa", notificationMemberAdded: "{name} adicionado com sucesso!", notificationMemberUpdated: "Membro \"{name}\" atualizado!", notificationMemberRemoved: "Membro removido com sucesso!", notificationAllMembersRemoved: "Todos os membros foram removidos!", notificationDataExported: "Dados exportados para {format}!", notificationDataImported: "{count} membros importados com sucesso!", notificationImportError: "Erro na importação: {error}", notificationMapCentered: "Mapa centralizado no Brasil", notificationMapTypeChanged: "Tipo de mapa alterado para: {type}", notificationFullscreen: "Modo Tela Cheia {status}", statusOn: "ativado", statusOff: "desativado", notificationNoDataToExport: "Não há dados para exportar", notificationRegionHasLeader: "A região {region} já possui um responsável ({leaderName}).", notificationNoMembersInRegion: "Não há membros na região {regionName}", notificationGeneratingReport: "Gerando relatório da região {regionName}...", notificationReportExported: "Relatório da região {regionName} exportado!", notificationErrorReport: "Erro ao gerar relatório.", confirmDelete: "Tem certeza que deseja remover o membro \"{memberName}\"?", confirmClearAll: "Você tem certeza que deseja remover TODOS os membros? Esta ação é irreversível.", confirmImport: "Isso substituirá os dados atuais por {count} novos membros. Deseja continuar?", reportTitle: "Relatório - Região", reportGeneratedOn: "Relatório Gerado em", reportTotalMembers: "Total de Membros", reportActiveStates: "Estados Ativos", reportDistributionByState: "Distribuição por Estado", reportMemberList: "Lista de Membros" 
    },
    en: { 
        appTitle: "Team Platform", appDescription: "Interactive platform for viewing and managing team members.", loadingApp: "Loading application...", headerTitle: "Team Platform", headerSubtitle: "Locate team members across Brazil", membersCountLabel: "members", addTab: "Add", listTab: "List", statsTab: "Statistics", addNewMemberTitle: "Add New Member", nameLabel: "Member's Name", namePlaceholder: "E.g., John Doe", phoneLabel: "Phone/WhatsApp", phonePlaceholder: "E.g., (555) 555-5555", stateLabel: "State", selectStateOption: "Select a state", cityLabel: "City", cityPlaceholder: "E.g., New York", regionalLeaderLabel: "Regional Leader", addMemberButton: "Add Member", teamMembersTitle: "Team Members", searchPlaceholder: "Search member...", emptyMemberList: "No members added yet.", teamStatsTitle: "Team Statistics", teamDataTitle: "Team Data", importJsonButton: "Import JSON", clearAllButton: "Clear All", exportListTitle: "Export Member List", regionalReportsTitle: "Regional Reports (PNG)", confirmActionTitle: "Confirm Action", cancelButton: "Cancel", confirmButton: "Confirm", editMemberTitle: "Edit Member", saveChangesButton: "Save Changes", locationLabel: "Location", locationNotEditable: "(not editable)", regionalLeaderBadge: "Regional Leader", regionLabel: "Region", editButton: "Edit", removeButton: "Remove", mapTypeStreet: "Streets", mapTypeSatellite: "Satellite", mapTypeTerrain: "Terrain", toggleDarkModeTooltip: "Toggle dark mode", exportJsonTooltip: "Export to JSON", exportPdfTooltip: "Export to PDF", exportXlsxTooltip: "Export to Excel", centerMapTooltip: "Center Map", fullscreenTooltip: "Fullscreen", mapTypeTooltip: "Change Map Type", notificationMemberAdded: "{name} added successfully!", notificationMemberUpdated: "Member \"{name}\" updated!", notificationMemberRemoved: "Member removed successfully!", notificationAllMembersRemoved: "All members have been removed!", notificationDataExported: "Data exported to {format}!", notificationDataImported: "{count} members imported successfully!", notificationImportError: "Import error: {error}", notificationMapCentered: "Map centered on Brazil", notificationMapTypeChanged: "Map type changed to: {type}", notificationFullscreen: "Fullscreen mode {status}", statusOn: "enabled", statusOff: "disabled", notificationNoDataToExport: "No data to export", notificationRegionHasLeader: "The {region} region already has a leader ({leaderName}).", notificationNoMembersInRegion: "No members in the {regionName} region", notificationGeneratingReport: "Generating report for {regionName} region...", notificationReportExported: "Report for {regionName} region exported!", notificationErrorReport: "Error generating report.", confirmDelete: "Are you sure you want to remove the member \"{memberName}\"?", confirmClearAll: "Are you sure you want to remove ALL members? This action is irreversible.", confirmImport: "This will replace current data with {count} new members. Do you want to continue?", reportTitle: "Report - Region", reportGeneratedOn: "Report Generated on", reportTotalMembers: "Total Members", reportActiveStates: "Active States", reportDistributionByState: "Distribution by State", reportMemberList: "Member List" 
    },
    es: { 
        appTitle: "Plataforma del Equipo", appDescription: "Plataforma interactiva para ver y gestionar miembros del equipo.", loadingApp: "Cargando aplicación...", headerTitle: "Plataforma del Equipo", headerSubtitle: "Localice miembros en todo Brasil", membersCountLabel: "miembros", addTab: "Añadir", listTab: "Lista", statsTab: "Estadísticas", addNewMemberTitle: "Añadir Nuevo Miembro", nameLabel: "Nombre del Miembro", namePlaceholder: "Ej: Juan Pérez", phoneLabel: "Teléfono/WhatsApp", phonePlaceholder: "Ej: (55) 5555-5555", stateLabel: "Estado", selectStateOption: "Seleccione un estado", cityLabel: "Ciudad", cityPlaceholder: "Ej: Madrid", regionalLeaderLabel: "Responsable de la Región", addMemberButton: "Añadir Miembro", teamMembersTitle: "Miembros del Equipo", searchPlaceholder: "Buscar miembro...", emptyMemberList: "Aún no se han añadido miembros.", teamStatsTitle: "Estadísticas del Equipo", teamDataTitle: "Datos del Equipo", importJsonButton: "Importar JSON", clearAllButton: "Limpiar Todo", exportListTitle: "Exportar Lista de Miembros", regionalReportsTitle: "Informes por Región (PNG)", confirmActionTitle: "Confirmar Acción", cancelButton: "Cancelar", confirmButton: "Confirmar", editMemberTitle: "Editar Miembro", saveChangesButton: "Guardar Cambios", locationLabel: "Ubicación", locationNotEditable: "(no editable)", regionalLeaderBadge: "Responsable Regional", regionLabel: "Región", editButton: "Editar", removeButton: "Eliminar", mapTypeStreet: "Calles", mapTypeSatellite: "Satélite", mapTypeTerrain: "Terreno", toggleDarkModeTooltip: "Alternar modo oscuro", exportJsonTooltip: "Exportar a JSON", exportPdfTooltip: "Exportar a PDF", exportXlsxTooltip: "Exportar a Excel", centerMapTooltip: "Centrar Mapa", fullscreenTooltip: "Pantalla Completa", mapTypeTooltip: "Cambiar Tipo de Mapa", notificationMemberAdded: "¡{name} añadido con éxito!", notificationMemberUpdated: "¡Miembro \"{name}\" actualizado!", notificationMemberRemoved: "¡Miembro eliminado con éxito!", notificationAllMembersRemoved: "¡Todos los miembros han sido eliminados!", notificationDataExported: "¡Datos exportados a {format}!", notificationDataImported: "¡{count} miembros importados con éxito!", notificationImportError: "Error de importación: {error}", notificationMapCentered: "Mapa centrado en Brasil", notificationMapTypeChanged: "Tipo de mapa cambiado a: {type}", notificationFullscreen: "Modo de pantalla completa {status}", statusOn: "activado", statusOff: "desactivado", notificationNoDataToExport: "No hay datos para exportar", notificationRegionHasLeader: "La región {region} ya tiene un responsable ({leaderName}).", notificationNoMembersInRegion: "No hay miembros en la región {regionName}", notificationGeneratingReport: "Generando informe para la región {regionName}...", notificationReportExported: "¡Informe de la región {regionName} exportado!", notificationErrorReport: "Error al generar el informe.", confirmDelete: "¿Está seguro de que desea eliminar al miembro \"{memberName}\"?", confirmClearAll: "¿Está seguro de que desea eliminar a TODOS los miembros? Esta acción es irreversible.", confirmImport: "Esto reemplazará los datos actuales con {count} nuevos miembros. ¿Desea continuar?", reportTitle: "Informe - Región", reportGeneratedOn: "Informe Generado el", reportTotalMembers: "Total de Miembros", reportActiveStates: "Estados Activos", reportDistributionByState: "Distribución por Estado", reportMemberList: "Lista de Miembros" 
    }
};

let currentLanguage = 'pt';

// NOVO: Função de Getter para exportar o idioma atual com segurança.
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Retorna a string traduzida para a chave e idioma atual.
 * @param {string} key A chave de tradução.
 * @param {Object} replacements Substituições para placeholders (e.g., {name}).
 * @returns {string} A string traduzida.
 */
export function getTranslatedString(key, replacements = {}) {
    let text = translations[currentLanguage]?.[key] || translations.pt[key] || `[${key}]`;
    for (const placeholder in replacements) {
        text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacements[placeholder]);
    }
    return text;
}

/**
 * Define o idioma atual e aplica as traduções no DOM.
 * @param {string} lang O código do idioma (e.g., 'pt', 'en', 'es').
 */
export function setLanguage(lang) {
    currentLanguage = translations[lang] ? lang : 'pt';
    localStorage.setItem('userLanguage', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.getElementById('languageSelector').value = currentLanguage;
    applyTranslations();
    // A chamada para updateAllUI (que chama populateStatesDropdown) deve vir do main.js/domListeners
}

/**
 * Aplica todas as traduções no DOM com base no idioma atual.
 */
export function applyTranslations() {
    document.querySelectorAll('[data-key]').forEach(el => {
        el.textContent = getTranslatedString(el.dataset.key);
    });
    document.querySelectorAll('[data-key-placeholder]').forEach(el => {
        el.placeholder = getTranslatedString(el.dataset.keyPlaceholder);
    });
    document.querySelectorAll('[data-key-title]').forEach(el => {
        el.title = getTranslatedString(el.dataset.keyTitle);
    });
}

/**
 * Carrega o idioma inicial do localStorage ou do navegador e o define.
 */
export function setInitialLanguage() {
    const userLang = localStorage.getItem('userLanguage') || navigator.language.split('-')[0];
    setLanguage(userLang);
}