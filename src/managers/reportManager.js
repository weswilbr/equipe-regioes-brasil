// Localização na Estrutura: /src/managers/reportManager.js

import { getMembers, replaceAllMembers, clearAllMembers } from '../data/store.js';
import * as UIManager from './uiManager.js';
import { showNotification } from '../utils/notifications.js';
import { getTranslatedString, currentLanguage } from '../config/i18n.js';
import { brazilStates } from '../data/locations.js';
import { REGION_COLORS, REPORT_IMAGE_WIDTH, REPORT_IMAGE_SCALE } from '../config/config.js';

/**
 * Módulo de Gerenciamento de Relatórios e Exportação
 * Controla a exportação de dados e a geração de relatórios visuais.
 */

// --- Funções de Exportação de Lista (JSON, PDF, XLSX) ---

/**
 * Exporta a lista completa de membros para o formato especificado.
 * @param {('json'|'pdf'|'xlsx')} format O formato de exportação.
 */
export function exportDataAs(format) {
    const members = getMembers();
    if (members.length === 0) { 
        showNotification(getTranslatedString('notificationNoDataToExport'), 'warning'); 
        return; 
    }
    
    const filename = `equipe-data-${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
        const blob = new Blob([JSON.stringify(members, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${filename}.json`);
    } else if (format === 'pdf') {
        exportToPDF(members, filename);
    } else if (format === 'xlsx') {
        exportToXLSX(members, filename);
    }

    showNotification(getTranslatedString('notificationDataExported', { format: format.toUpperCase() }), 'success');
}

/**
 * Helper para forçar o download de um Blob.
 * @param {Blob} blob 
 * @param {string} filename 
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Gera um PDF da lista de membros (requer jspdf/autotable).
 * @param {Array} members 
 * @param {string} filename 
 */
function exportToPDF(members, filename) {
    // A biblioteca jspdf deve estar carregada globalmente via CDN
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const head = [
        [getTranslatedString('nameLabel'), getTranslatedString('phoneLabel'), getTranslatedString('cityLabel'), getTranslatedString('stateLabel'), getTranslatedString('regionLabel'), getTranslatedString('regionalLeaderLabel')]
    ];
    
    const body = members.map(m => {
        const s = brazilStates[m.state];
        return [
            m.name, 
            m.phone||'-', 
            m.city||s.name, 
            s.name, 
            s.region, 
            m.isLeader ? getTranslatedString('statusOn') : getTranslatedString('statusOff')
        ];
    });

    doc.autoTable({ head, body, theme: 'striped' });
    doc.save(`${filename}.pdf`);
}

/**
 * Gera uma planilha XLSX da lista de membros (requer xlsx.full.min.js).
 * @param {Array} members 
 * @param {string} filename 
 */
function exportToXLSX(members, filename) {
    const data = members.map(m => {
        const s = brazilStates[m.state];
        return { 
            [getTranslatedString('nameLabel')]: m.name, 
            [getTranslatedString('phoneLabel')]: m.phone||'', 
            [getTranslatedString('cityLabel')]: m.city||s.name, 
            [getTranslatedString('stateLabel')]: s.name, 
            [getTranslatedString('regionLabel')]: s.region, 
            [getTranslatedString('regionalLeaderLabel')]: m.isLeader ? getTranslatedString('statusOn') : getTranslatedString('statusOff')
        };
    });
    
    // As bibliotecas XLSX e XLSX.utils devem estar carregadas globalmente via CDN
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, getTranslatedString('teamMembersTitle'));
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// --- Funções de Importação ---

/**
 * Inicia o fluxo de importação, acionando o input de arquivo.
 */
export function startImportFlow() {
    document.getElementById('jsonFileInput').click();
}

/**
 * Processa o arquivo JSON selecionado.
 * @param {File} file
 */
export function processImportFile(file) {
    const reader = new FileReader();
    reader.onload = evt => {
        try {
            const data = JSON.parse(evt.target.result);
            if (!Array.isArray(data)) {
                throw new Error(getTranslatedString('notificationImportError', { error: 'Invalid format' }));
            }
            
            // Requer confirmação antes de substituir dados
            UIManager.showConfirmModal(
                getTranslatedString('confirmImport', { count: data.length }),
                () => {
                    replaceAllMembers(data);
                    // Chamadas de atualização pós-sucesso
                    MapManager.updateAllMarkersOnMap();
                    UIManager.updateAllUI();
                }
            );

        } catch(err) { 
            showNotification(getTranslatedString('notificationImportError', { error: err.message || 'Arquivo inválido' }), 'error');
        }
    };
    reader.readAsText(file);
}

// --- Funções de Relatórios Visuais (PNG) ---

/**
 * Gera um relatório visual para uma região específica e o exporta como PNG.
 * @param {string} regionName O nome da região (e.g., 'Norte').
 */
export async function exportRegionReport(regionName) {
    const members = getMembers();
    const regionMembers = members.filter(m => brazilStates[m.state]?.region === regionName);
    
    if (regionMembers.length === 0) { 
        showNotification(getTranslatedString('notificationNoMembersInRegion', { regionName }), 'warning'); 
        return; 
    }
    
    showNotification(getTranslatedString('notificationGeneratingReport', { regionName }), 'info');
    
    const reportHTML = generateRegionReportHTML(regionName, regionMembers);
    const container = document.getElementById('reportContainer'); 
    container.innerHTML = reportHTML;
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Aguarda renderização
    
    try {
        // Temporariamente move o container para uma posição renderizável
        container.style.position = 'relative';
        container.style.left = '0';
        
        // html2canvas deve estar carregado globalmente via CDN
        const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: REPORT_IMAGE_SCALE, 
            width: REPORT_IMAGE_WIDTH, 
            windowWidth: REPORT_IMAGE_WIDTH 
        });

        // Restaura a posição
        container.style.position = 'absolute';
        container.style.left = '-9999px';

        canvas.toBlob(blob => {
            const filename = `relatorio-${regionName.toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
            downloadBlob(blob, filename);
            showNotification(getTranslatedString('notificationReportExported', { regionName }), 'success');
        }, 'image/png');
        
    } catch (error) { 
        console.error('Erro ao gerar relatório:', error);
        showNotification(getTranslatedString('notificationErrorReport'), 'error'); 
    } finally { 
        container.innerHTML = ''; 
    }
}

/**
 * Gera o HTML completo e estilizado do relatório regional.
 * @param {string} regionName
 * @param {Array<Object>} regionMembers
 * @returns {string} HTML estilizado.
 */
function generateRegionReportHTML(regionName, regionMembers) {
    const color = REGION_COLORS[regionName]; 
    
    // Agrupamento de dados
    const byState = {};
    regionMembers.forEach(m => byState[m.state] = (byState[m.state] || 0) + 1);
    const sortedStates = Object.entries(byState).sort((a, b) => b[1] - a[1]);
    const sortedMembers = regionMembers.sort((a, b) => a.name.localeCompare(b.name));
    
    const date = new Date().toLocaleDateString(currentLanguage);
    const regionIcons = { 'Norte': '🌳', 'Nordeste': '☀️', 'Centro-Oeste': '🌾', 'Sudeste': '🏙️', 'Sul': '❄️' };
    
    return `
        <div style="font-family:'Inter',sans-serif;padding:40px;background:white;width:${REPORT_IMAGE_WIDTH}px;box-sizing:border-box;">
            <!-- Cabeçalho -->
            <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid ${color.bg};">
                <div style="font-size: 60px; margin-bottom: 10px;">${regionIcons[regionName]}</div>
                <h1 style="color: ${color.text}; font-size: 42px; font-weight: 800; margin: 0 0 10px 0;">
                    ${getTranslatedString('reportTitle')} ${regionName}
                </h1>
                <p style="color: #6b7280; font-size: 18px; margin: 0;">${getTranslatedString('reportGeneratedOn')} ${date}</p>
            </div>

            <!-- Métricas Principais -->
            <div style="display: flex; justify-content: space-around; gap: 30px; margin-bottom: 40px;">
                <div style="flex: 1; text-align: center; padding: 20px; background: ${color.light}; border-radius: 8px;">
                    <p style="color: ${color.text}; font-size: 16px; margin: 0;">${getTranslatedString('reportTotalMembers')}</p>
                    <p style="font-size: 48px; font-weight: 800; color: ${color.text}; margin: 10px 0 0 0;">${regionMembers.length}</p>
                </div>
                <div style="flex: 1; text-align: center; padding: 20px; background: ${color.light}; border-radius: 8px;">
                    <p style="color: ${color.text}; font-size: 16px; margin: 0;">${getTranslatedString('reportActiveStates')}</p>
                    <p style="font-size: 48px; font-weight: 800; color: ${color.text}; margin: 10px 0 0 0;">${sortedStates.length}</p>
                </div>
            </div>

            <div style="display: flex; gap: 40px;">
                <!-- Distribuição por Estado -->
                <div style="flex: 1; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px;">${getTranslatedString('reportDistributionByState')}</h2>
                    ${sortedStates.map(([code, count]) => { 
                        const stateName = brazilStates[code].name;
                        const percentage = (count / regionMembers.length * 100).toFixed(1); 
                        return `
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 4px;">
                                    <span style="color: #4b5563;">${stateName} (${code})</span>
                                    <span style="font-weight: 600; color: #1f2937;">${count} (${percentage}%)</span>
                                </div>
                                <div style="width: 100%; background: #e5e7eb; border-radius: 4px; height: 8px;">
                                    <div style="height: 8px; border-radius: 4px; background-color: ${color.bg}; width: ${percentage}%;"></div>
                                </div>
                            </div>`; 
                    }).join('')}
                </div>
                
                <!-- Lista de Membros por Nome -->
                <div style="flex: 1; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px;">${getTranslatedString('reportMemberList')} (${regionMembers.length} ${getTranslatedString('membersCountLabel')})</h2>
                    <ul style="list-style-type: none; padding: 0; max-height: 400px; overflow-y: auto; margin:0;">
                        ${sortedMembers.map(m => `
                            <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 16px; color: #1f2937;">
                                <strong>${m.name}</strong> - ${m.city ? `${m.city}, ` : ''}${m.state}
                                ${m.isLeader ? `<span style="color: ${color.text}; font-weight: 600;"> (Líder)</span>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>

            <!-- Rodapé do Relatório -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #9ca3af;">
                ${getTranslatedString('reportGeneratedOn')} ${date}
            </div>
        </div>
    `;
}