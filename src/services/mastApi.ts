import axios from 'axios';
import { mastConfig } from '@/config/mast.config';

// Create authenticated axios instance
const mastAxios = axios.create({
  baseURL: 'https://mast.stsci.edu/api/v0',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth interceptor
mastAxios.interceptors.request.use(async (config) => {
  const token = mastConfig.apiToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for auth errors
mastAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please check your MAST API token.');
      // Could redirect to auth page here if needed
    }
    return Promise.reject(error);
  }
);

export interface MastSearchParams {
  ra?: number;
  dec?: number;
  radius?: number;
  maxRecords?: number;
  targetName?: string;
}

export interface ImageMetadata {
  url: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  instrument: string;
  dateObs?: string;
  wavelength?: string;
  exposure?: number;
  coordinates?: {
    ra: number;
    dec: number;
    equinox: string;
  };
  collection?: string;
  proposalId?: string;
  dataRights?: string;
  calib_level?: number;
  obsid?: string;
  target?: {
    name: string;
    type?: string;
    ra?: number;
    dec?: number;
  };
}

class MastApiService {
  static async searchImages(params: MastSearchParams): Promise<ImageMetadata[]> {
    try {
      // First resolve target name if provided
      let resolvedCoords = null;
      if (params.targetName && (!params.ra || !params.dec)) {
        resolvedCoords = await this.resolveTargetName(params.targetName);
        if (!resolvedCoords) {
          throw new Error(`Could not resolve target name: ${params.targetName}`);
        }
      }

      // Prepare search parameters for MAST Portal API
      const searchParams = {
        service: "Mast.Caom.Cone",
        params: {
          ra: resolvedCoords?.ra || params.ra,
          dec: resolvedCoords?.dec || params.dec,
          radius: params.radius || 0.2,
          format: 'json',
          columns: '*',
          maxRecords: params.maxRecords || 100,
          ordercolumn: 'distance',
          filters: [
            {
              paramName: 'dataproduct_type',
              values: ['image']
            },
            {
              paramName: 'intentType',
              values: ['science']
            },
            {
              paramName: 'calib_level',
              values: [2, 3]
            }
          ]
        }
      };

      // Execute search
      const response = await mastAxios.post('/invoke', searchParams);
      console.log('MAST API Response:', response.data);

      if (!response.data?.data) {
        throw new Error('Invalid response from MAST API');
      }

      // Transform and filter response data
      return response.data.data
        .filter((item: any) => {
          // Ensure we have valid data URIs and preview URLs
          return (
            item.dataURI || 
            item.dataURL || 
            item.accessUrl || 
            item.preview_url || 
            item.s_preview_url
          );
        })
        .map((item: any) => this.transformImageData(item));
    } catch (error) {
      console.error('Error searching MAST images:', error);
      throw error;
    }
  }

  private static async resolveTargetName(targetName: string): Promise<{ ra: number; dec: number } | null> {
    try {
      const resolveResponse = await mastAxios.post('/invoke', {
        service: "Mast.Name.Lookup",
        params: {
          input: targetName,
          format: 'json'
        }
      });

      console.log('Name Resolution Response:', resolveResponse.data);

      if (resolveResponse.data?.data?.[0]) {
        const result = resolveResponse.data.data[0];
        return {
          ra: parseFloat(result.ra),
          dec: parseFloat(result.dec)
        };
      }
      return null;
    } catch (error) {
      console.error('Error resolving target name:', error);
      return null;
    }
  }

  private static transformImageData(item: any): ImageMetadata {
    // Determine the best URL to use
    const dataUrl = item.dataURI || item.dataURL || item.accessUrl;
    const previewUrl = item.preview_url || item.s_preview_url;

    // Construct proper URLs
    const baseUrl = 'https://mast.stsci.edu';
    const url = dataUrl ? 
      (dataUrl.startsWith('http') ? dataUrl : `${baseUrl}/api/v0/download/file?uri=${encodeURIComponent(dataUrl)}`) :
      undefined;
    const thumbnailUrl = previewUrl ?
      (previewUrl.startsWith('http') ? previewUrl : `${baseUrl}${previewUrl}`) :
      undefined;

    return {
      url: url!,
      thumbnailUrl,
      title: item.obs_title || item.target_name || 'Untitled Image',
      description: this.generateDescription(item),
      instrument: item.instrument_name || item.obs_collection,
      dateObs: item.t_min || item.t_max || item.obs_time,
      wavelength: item.em_min && item.em_max ? `${item.em_min}-${item.em_max}` : undefined,
      exposure: parseFloat(item.t_exptime) || undefined,
      coordinates: {
        ra: parseFloat(item.s_ra),
        dec: parseFloat(item.s_dec),
        equinox: item.spatial_scale || 'J2000'
      },
      collection: item.obs_collection,
      proposalId: item.proposal_id,
      dataRights: item.dataRights,
      calib_level: parseInt(item.calib_level),
      obsid: item.obsid,
      target: {
        name: item.target_name,
        type: item.target_classification,
        ra: parseFloat(item.s_ra),
        dec: parseFloat(item.s_dec)
      }
    };
  }

  private static generateDescription(item: any): string {
    const parts = [];
    
    if (item.target_name) {
      parts.push(`Target: ${item.target_name}`);
    }
    
    if (item.instrument_name) {
      parts.push(`Instrument: ${item.instrument_name}`);
    }
    
    if (item.obs_collection) {
      parts.push(`Collection: ${item.obs_collection}`);
    }
    
    if (item.proposal_id) {
      parts.push(`Proposal ID: ${item.proposal_id}`);
    }
    
    if (item.t_exptime) {
      parts.push(`Exposure: ${item.t_exptime}s`);
    }
    
    if (item.em_min && item.em_max) {
      parts.push(`Wavelength: ${item.em_min}-${item.em_max}`);
    }
    
    if (item.calib_level) {
      parts.push(`Calibration Level: ${item.calib_level}`);
    }

    if (item.obs_title) {
      parts.push(`Title: ${item.obs_title}`);
    }

    if (item.project) {
      parts.push(`Project: ${item.project}`);
    }

    if (item.filters) {
      parts.push(`Filters: ${item.filters}`);
    }

    return parts.join(' | ');
  }

  static async getRandomDiscovery(): Promise<{ ra: number; dec: number; name: string }> {
    const popularTargets = [
      { ra: 83.82208, dec: -5.39111, name: 'Orion Nebula' },
      { ra: 10.68458, dec: 41.26917, name: 'Andromeda Galaxy' },
      { ra: 56.85000, dec: 24.11667, name: 'Pleiades' },
      { ra: 189.20375, dec: 62.21611, name: 'Hubble Deep Field' },
      { ra: 83.63292, dec: 22.01444, name: 'Crab Nebula' },
      { ra: 202.48625, dec: 47.19528, name: 'Whirlpool Galaxy' },
      { ra: 187.70583, dec: 12.39111, name: 'Virgo Cluster' },
      { ra: 148.88822, dec: 69.06529, name: 'M81' },
      { ra: 40.66963, dec: 0.01323, name: 'Cetus A' },
      { ra: 201.36500, dec: -43.01917, name: 'Centaurus A' },
      { ra: 185.72917, dec: 15.82222, name: 'Sombrero Galaxy' },
      { ra: 210.80242, dec: 54.34917, name: 'Pinwheel Galaxy' },
      { ra: 69.68208, dec: -1.20278, name: 'Flame Nebula' },
      { ra: 83.86625, dec: -5.38778, name: 'Trapezium Cluster' },
      { ra: 161.95833, dec: -59.97500, name: 'Eta Carinae Nebula' }
    ];

    const randomIndex = Math.floor(Math.random() * popularTargets.length);
    const target = popularTargets[randomIndex];
    console.log(`Selected random target: ${target.name} at RA: ${target.ra}, Dec: ${target.dec}`);
    return target;
  }
}

export default MastApiService;
