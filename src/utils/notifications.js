// Localização na Estrutura: /src/utils/notifications.js

/**
 * Módulo de Utilidades de Notificação (Wrapper para Toastify-JS).
 * Centraliza a lógica de exibição de feedback ao usuário.
 */

/**
 * Exibe uma notificação pop-up na tela.
 * @param {string} message A mensagem a ser exibida.
 * @param {('success'|'error'|'warning'|'info')} [type='success'] O tipo de notificação, que define a cor.
 */
export function showNotification(message, type = 'success') {
    // Objeto de mapeamento de cores para os tipos de notificação
    const backgroundColor = {
        success: 'linear-gradient(to right, #10b981, #059669)', // Verde
        error: 'linear-gradient(to right, #ef4444, #dc2626)',     // Vermelho
        warning: 'linear-gradient(to right, #f59e0b, #d97706)',   // Laranja
        info: 'linear-gradient(to right, #3b82f6, #2563eb)'       // Azul
    };

    // 'Toastify' é uma variável global carregada via CDN no index.html
    if (typeof Toastify === 'undefined') {
        console.warn(`Notificação: ${type.toUpperCase()} - ${message}`);
        return;
    }

    Toastify({
        text: message,
        duration: 3000, // 3 segundos
        gravity: "top", // Posição vertical
        position: "right", // Posição horizontal
        style: {
            background: backgroundColor[type] || backgroundColor.info,
            // Adiciona um estilo básico para garantir que o texto branco funcione no dark mode do OS
            color: '#ffffff' 
        },
        stopOnFocus: true, // Pausa a contagem regressiva ao focar
    }).showToast();
}