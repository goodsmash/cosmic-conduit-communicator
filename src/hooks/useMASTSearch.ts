import { useState } from 'react'
import { MASTDataProduct, MASTSearchParams, SpectralData, mastDataService } from '@/services/mastDataService'

export function useMASTSearch() {
  const [data, setData] = useState<MASTDataProduct[]>([])
  const [spectralData, setSpectralData] = useState<SpectralData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (params: MASTSearchParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const results = await mastDataService.searchObjects(params)
      setData(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search MAST objects')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  const getSpectralData = async (target: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await mastDataService.getSpectralData(target)
      setSpectralData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spectral data')
      setSpectralData(null)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    data,
    spectralData,
    isLoading,
    error,
    search,
    getSpectralData
  }
}
