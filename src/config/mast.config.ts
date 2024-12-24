interface MASTConfig {
  apiToken: string;
  baseUrl: string;
  timeout: number;
  authUrl: string;
  clientId: string;
  redirectUri: string;
}

export const mastConfig: MASTConfig = {
  apiToken: import.meta.env.VITE_MAST_API_TOKEN || '',
  baseUrl: 'https://mast.stsci.edu/api/v0',
  timeout: 30000,
  authUrl: 'https://auth.mast.stsci.edu/oauth/authorize',
  clientId: import.meta.env.VITE_MAST_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_MAST_REDIRECT_URI || ''
};

// Validate configuration
if (!mastConfig.apiToken) {
  console.error('MAST API token is not configured. Set VITE_MAST_API_TOKEN in your environment variables.');
}

if (!mastConfig.clientId) {
  console.error('MAST client ID is not configured. Set VITE_MAST_CLIENT_ID in your environment variables.');
}

export const MAST_AUTH_SCOPE = 'mast:user mast:download';

export const MAST_ENDPOINTS = {
  SEARCH: '/invoke',
  CATALOGS: '/catalogs/v0.1',
  RESOLVER: '/resolver/v0',
  DOWNLOAD: '/download/file',
  AUTH: '/oauth/authorize',
  TOKEN: '/oauth/token'
};

export const MAST_SERVICES = {
  CONE_SEARCH: 'Mast.Caom.Cone',
  FILTERED: 'Mast.Caom.Filtered',
  NAME_LOOKUP: 'Mast.Name.Lookup',
  CATALOG: 'Mast.Catalogs'
} as const;

export const MAST_COLLECTIONS = {
  HST: 'HST',
  JWST: 'JWST',
  TESS: 'TESS',
  GALEX: 'GALEX',
  KEPLER: 'Kepler',
  K2: 'K2',
  PANSTARRS: 'PanSTARRS'
} as const;

export const MAST_DATA_PRODUCTS = {
  IMAGE: 'image',
  SPECTRUM: 'spectrum',
  TIMESERIES: 'timeseries',
  CATALOG: 'catalog',
  SIMULATION: 'simulation'
} as const;

export const MAST_INTENT_TYPES = {
  SCIENCE: 'science',
  CALIBRATION: 'calibration'
} as const;

export const MAST_CALIB_LEVELS = {
  RAW: 1,
  CALIBRATED: 2,
  PRODUCT: 3,
  ANALYSIS: 4
} as const;
