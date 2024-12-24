interface JWSTProgram {
  program: number;
}

interface JWSTInstrument {
  instrument: string;
}

interface JWSTDetails {
  mission: string;
  instruments: JWSTInstrument[];
  suffix: string;
  description: string;
}

interface JWSTObservation {
  id: string;
  observation_id: string;
  program: number;
  details: JWSTDetails;
  file_type: string;
  thumbnail: string;
  location: string;
}

interface JWSTResponse {
  statusCode: number;
  body: JWSTObservation[];
  error: string;
}

interface FilterOptions {
  fileType?: string;
  suffix?: string;
  instrument?: string;
}

const JWST_API_BASE = 'https://api.jwstapi.com';
const MAST_API_BASE = 'https://mast.stsci.edu/api/v0';

export async function fetchPrograms(): Promise<number[]> {
  const response = await fetch(`${JWST_API_BASE}/program/list`, {
    headers: {
      'X-API-KEY': process.env.REACT_APP_JWST_API_KEY || ''
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch JWST programs');
  }
  const data = await response.json();
  return data.body.map((p: JWSTProgram) => p.program);
}

export async function fetchProgramObservations(
  programId: number, 
  filters: FilterOptions = {}
): Promise<JWSTObservation[]> {
  const response = await fetch(`${JWST_API_BASE}/program/id/${programId}`, {
    headers: {
      'X-API-KEY': process.env.REACT_APP_JWST_API_KEY || ''
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch observations for program ${programId}`);
  }
  
  const data: JWSTResponse = await response.json();
  
  // Apply filters
  return data.body.filter(obs => {
    const matchesFileType = !filters.fileType || obs.file_type === filters.fileType;
    const matchesSuffix = !filters.suffix || obs.details.suffix === filters.suffix;
    const matchesInstrument = !filters.instrument || 
      obs.details.instruments.some(i => i.instrument === filters.instrument);
    
    return matchesFileType && matchesSuffix && matchesInstrument;
  });
}

export async function fetchSuffixTypes(): Promise<{ suffix: string; description: string; }[]> {
  const response = await fetch(`${JWST_API_BASE}/suffix/list`, {
    headers: {
      'X-API-KEY': process.env.REACT_APP_JWST_API_KEY || ''
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch suffix types');
  }
  const data = await response.json();
  return data.body;
}

export async function fetchInstrumentList(): Promise<string[]> {
  // Common JWST instruments
  return ['NIRCam', 'MIRI', 'NIRSpec', 'NIRISS', 'FGS'];
}

export async function fetchMASTData(programId: number): Promise<any> {
  const response = await fetch(`${MAST_API_BASE}/jwst/filtered/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      columns: "*",
      filters: [
        {
          paramName: "program",
          values: [programId]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch MAST data');
  }

  return response.json();
}

// Helper function to convert FITS to JPG URL
export function getFitsPreviewUrl(fitsUrl: string): string {
  // MAST provides JPG previews for FITS files
  return fitsUrl.replace('.fits', '.jpg');
}

export const webbTelescopeService = {
  fetchPrograms,
  fetchProgramObservations,
  fetchSuffixTypes,
  fetchInstrumentList,
  fetchMASTData,
  getFitsPreviewUrl,
};
