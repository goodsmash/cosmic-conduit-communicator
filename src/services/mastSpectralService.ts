import axios from 'axios'
import { mastConfig } from '@/config/mast.config'
import { mastAuthService } from './mastAuthService'

const api = axios.create({
  baseURL: mastConfig.baseUrl,
  timeout: mastConfig.timeout
})

api.interceptors.request.use(async (config) => {
  if (mastAuthService.needsRefresh()) {
    mastAuthService.initiateAuth()
    throw new Error('Authentication token expired. Please try again after re-authentication.')
  }

  const token = mastAuthService.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  config.headers['Accept'] = 'application/json'
  config.headers['Content-Type'] = 'application/json'
  
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      mastAuthService.logout()
      mastAuthService.initiateAuth()
    }
    return Promise.reject(error)
  }
)

export interface SpectralSearchParams {
  wavelength?: [number, number]
  'flux.gte'?: number
  'flux.lte'?: number
  'derSnr.gt'?: number
  'derSnr.lt'?: number
  instrument?: string
  target?: string
  limit?: number
}

export interface SpectralDataPoint {
  wavelength: number
  flux: number
  error: number
  derSnr: number
  metadata: {
    targetName: string
    instrument: string
    filter: string
    exposure: number
    obsDate: string
  }
}

export interface SpectralRetrieveResponse {
  status: string
  message: string
  data: {
    metadata: {
      columns: Record<string, { unit: string; description: string }>
    }
    arrays: {
      wavelength: number[]
      flux: number[]
      error: number[]
      derSnr: number[]
    }
  }
}

export interface SpectralSearchResponse {
  status: string
  message: string
  query: string
  results: SpectralDataPoint[]
}

class MASTSpectralService {
  private async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await api.get(endpoint, { params })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your MAST API token.')
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
      }
      console.error('MAST API Error:', error)
      throw new Error('Failed to fetch data from MAST API')
    }
  }

  /**
   * Search for spectral data points based on various parameters
   */
  async searchSpectralData(params: SpectralSearchParams): Promise<SpectralSearchResponse> {
    const searchParams: Record<string, string> = {}
    
    if (params.wavelength) {
      searchParams.wavelength = params.wavelength.join(',')
    }
    if (params['flux.gte'] !== undefined) {
      searchParams['flux.gte'] = params['flux.gte'].toString()
    }
    if (params['flux.lte'] !== undefined) {
      searchParams['flux.lte'] = params['flux.lte'].toString()
    }
    if (params['derSnr.gt'] !== undefined) {
      searchParams['derSnr.gt'] = params['derSnr.gt'].toString()
    }
    if (params['derSnr.lt'] !== undefined) {
      searchParams['derSnr.lt'] = params['derSnr.lt'].toString()
    }
    if (params.instrument) {
      searchParams.instrument = params.instrument
    }
    if (params.target) {
      searchParams.target = params.target
    }
    if (params.limit) {
      searchParams.limit = params.limit.toString()
    }

    return this.get<SpectralSearchResponse>('search', searchParams)
  }

  /**
   * Retrieve spectral data for a specific MAST data URI
   */
  async retrieveSpectralData(uri: string): Promise<SpectralRetrieveResponse> {
    return this.get<SpectralRetrieveResponse>('retrieve', { uri })
  }

  /**
   * Get spectral data for a specific galaxy with authentication
   */
  async getGalaxySpectralData(galaxyName: string, wavelengthRange?: [number, number]) {
    if (!mastAuthService.getAccessToken()) {
      throw new Error('MAST API token not configured. Please set NEXT_PUBLIC_MAST_API_TOKEN in your environment.')
    }

    const searchParams: SpectralSearchParams = {
      target: galaxyName,
      'derSnr.gt': 5,
      limit: 1000
    }

    if (wavelengthRange) {
      searchParams.wavelength = wavelengthRange
    }

    return this.searchSpectralData(searchParams)
  }

  /**
   * Get all available spectral data for multiple galaxies
   */
  async getMultipleGalaxiesData(galaxyNames: string[]) {
    return Promise.all(
      galaxyNames.map(name => this.getGalaxySpectralData(name))
    )
  }

  /**
   * Get spectral data within specific wavelength ranges for color analysis
   */
  async getGalaxyColorData(galaxyName: string) {
    const ranges = {
      red: [0.6, 0.7],   // Red wavelength range (microns)
      green: [0.5, 0.6], // Green wavelength range
      blue: [0.4, 0.5]   // Blue wavelength range
    }

    const colorData = await Promise.all(
      Object.entries(ranges).map(async ([color, range]) => {
        const data = await this.getGalaxySpectralData(galaxyName, range)
        return {
          color,
          data: data.results
        }
      })
    )

    return colorData.reduce((acc, { color, data }) => {
      acc[color] = data
      return acc
    }, {} as Record<string, SpectralDataPoint[]>)
  }
}

export const mastSpectralService = new MASTSpectralService()
