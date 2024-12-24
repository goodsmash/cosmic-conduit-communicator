import axios from 'axios'
import { GalaxyTarget } from '@/data/targetCatalog'

const MAST_API_URL = 'https://mast.stsci.edu/api/v0'
const MAST_TOKEN = '8270ee02c1884d66a8cf890ccc23c487'

export interface MASTSearchParams {
  target?: string
  coordinates?: {
    ra: number
    dec: number
  }
  radius?: number
  objectTypes?: string[]
  pageSize?: number
  page?: number
}

export interface SpectralData {
  wavelength: number[]
  flux: number[]
  emissionLines: {
    wavelength: number
    element: string
    intensity: number
  }[]
  absorptionLines: {
    wavelength: number
    element: string
    depth: number
  }[]
  temperature?: number
  age?: number
  metallicity?: number
}

export interface MASTDataProduct {
  id: string
  target: string
  coordinates?: {
    ra: number
    dec: number
  }
  objectType: string
  releaseDate: string
  dataRights: string
}

class MASTDataService {
  private axiosInstance = axios.create({
    baseURL: MAST_API_URL,
    headers: {
      'Authorization': `Token ${MAST_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  async searchObjects(params: MASTSearchParams): Promise<MASTDataProduct[]> {
    try {
      console.log('Searching with params:', params)
      const response = await this.axiosInstance.post('/invoke', {
        service: 'Mast.Caom.Filtered.Position',
        format: 'json',
        params: {
          columns: '*',
          filters: [
            {
              paramName: 'target_classification',
              values: params.objectTypes || ['galaxy']
            }
          ],
          ...(params.target && {
            target_name: params.target
          }),
          ...(params.coordinates && {
            ra: params.coordinates.ra,
            dec: params.coordinates.dec,
            radius: params.radius || 0.2
          }),
          pagesize: params.pageSize || 10,
          page: params.page || 1
        }
      })

      console.log('Search response:', response.data)
      return this.transformSearchResults(response.data?.data || [])
    } catch (error) {
      console.error('MAST search error:', error)
      throw new Error('Failed to search MAST objects')
    }
  }

  async getSpectralData(target: string): Promise<SpectralData> {
    try {
      console.log('Fetching spectral data for:', target)
      const response = await this.axiosInstance.post('/invoke', {
        service: 'Mast.Caom.Spectra.Filtered',
        params: {
          target_name: target,
          format: 'json'
        }
      })

      console.log('Spectral response:', response.data)
      return this.transformSpectralData(response.data)
    } catch (error) {
      console.error('MAST spectral data error:', error)
      throw new Error('Failed to fetch spectral data')
    }
  }

  async searchByCoordinates(ra: number, dec: number, radius: number = 0.2): Promise<MASTDataProduct[]> {
    return this.searchObjects({
      coordinates: { ra, dec },
      radius,
      pageSize: 10
    })
  }

  async searchByName(targetName: string): Promise<MASTDataProduct[]> {
    return this.searchObjects({
      target: targetName,
      pageSize: 10
    })
  }

  private transformSearchResults(data: any[]): MASTDataProduct[] {
    if (!Array.isArray(data)) {
      console.warn('Unexpected data format:', data)
      return []
    }

    return data.map(item => ({
      id: item.obsid || item.target_name || Math.random().toString(),
      target: item.target_name || 'Unknown',
      coordinates: item.s_ra && item.s_dec ? {
        ra: parseFloat(item.s_ra),
        dec: parseFloat(item.s_dec)
      } : undefined,
      objectType: item.target_classification || item.objtype || 'unknown',
      releaseDate: item.t_obs || new Date().toISOString(),
      dataRights: item.dataRights || 'public'
    }))
  }

  private transformSpectralData(data: any): SpectralData {
    const spectralData: SpectralData = {
      wavelength: [],
      flux: [],
      emissionLines: [],
      absorptionLines: []
    }

    if (!data?.data?.[0]) {
      console.warn('No spectral data found')
      return spectralData
    }

    const spectra = data.data[0]
    spectralData.wavelength = spectra.wavelength || []
    spectralData.flux = spectra.flux || []

    // Extract spectral lines if available
    if (spectra.spectral_lines) {
      spectra.spectral_lines.forEach((line: any) => {
        const spectralLine = {
          wavelength: line.wavelength,
          element: line.element,
          intensity: line.intensity || line.depth || 1
        }

        if (line.type === 'emission') {
          spectralData.emissionLines.push(spectralLine)
        } else if (line.type === 'absorption') {
          spectralData.absorptionLines.push(spectralLine)
        }
      })
    }

    // Add derived properties if available
    if (spectra.derived_properties) {
      spectralData.temperature = spectra.derived_properties.temperature
      spectralData.age = spectra.derived_properties.age
      spectralData.metallicity = spectra.derived_properties.metallicity
    }

    return spectralData
  }
}

export const mastDataService = new MASTDataService()
