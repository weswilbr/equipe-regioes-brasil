// Localização na Estrutura: /src/config/config.js

/**
 * Constantes e configurações globais da aplicação.
 */

// Chave de armazenamento local
export const LOCAL_STORAGE_KEY = 'plataformaEquipe_v3';

// Coordenadas de centralização do Brasil para o mapa (DF - Centro Geográfico)
export const BRAZIL_CENTER_COORDS = [-15.7797, -47.9297];
export const INITIAL_MAP_ZOOM = 5;

// Raio de distribuição (em graus de latitude/longitude) para evitar marcadores sobrepostos no centro do estado
export const DISTRIBUTION_RADIUS = 0.8;

// Configurações de exportação
export const REPORT_IMAGE_WIDTH = 1200;
export const REPORT_IMAGE_SCALE = 2; // Para alta resolução

// Tipos de mapa
export const MAP_TYPES = {
    street: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        nameKey: 'mapTypeStreet' // Chave de tradução
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        nameKey: 'mapTypeSatellite' // Chave de tradução
    },
    terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: 'Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap (CC-BY-SA)',
        nameKey: 'mapTypeTerrain' // Chave de tradução
    }
};

// Cores das regiões
export const REGION_COLORS = {
    'Norte': { bg: '#10b981', text: '#065f46', light: '#d1fae5' }, // Verde (Esmeralda)
    'Nordeste': { bg: '#f59e0b', text: '#92400e', light: '#fef3c7' }, // Laranja (Âmbar)
    'Centro-Oeste': { bg: '#f97316', text: '#9a3412', light: '#ffedd5' }, // Laranja Forte (Laranja)
    'Sudeste': { bg: '#3b82f6', text: '#1e3a8a', light: '#dbeafe' }, // Azul (Índigo)
    'Sul': { bg: '#8b5cf6', text: '#5b21b6', light: '#ede9fe' } // Roxo (Violeta)
};
