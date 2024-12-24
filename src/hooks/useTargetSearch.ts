import { useState, useCallback, useMemo } from 'react'
import { GalaxyTarget, searchTargets, findNearbyTargets, getTargetsByCategory } from '@/data/targetCatalog'
import { useMASTAuth } from './useMASTAuth'
import { useSpectralData } from './useSpectralData'

interface TargetSearchState {
  selectedTarget: GalaxyTarget | null
  searchResults: GalaxyTarget[]
  nearbyTargets: GalaxyTarget[]
  isLoading: boolean
  error: string | null
}

interface UseTargetSearchProps {
  initialTarget?: string
  searchRadius?: number
}

export function useTargetSearch({ 
  initialTarget,
  searchRadius = 1.0 
}: UseTargetSearchProps = {}) {
  const { isAuthenticated } = useMASTAuth()
  const [state, setState] = useState<TargetSearchState>({
    selectedTarget: null,
    searchResults: [],
    nearbyTargets: [],
    isLoading: false,
    error: null
  })

  // Get spectral data for selected target
  const { spectralData, isLoading: isLoadingSpectral } = useSpectralData(
    state.selectedTarget?.name || ''
  )

  // Search for targets
  const searchGalaxies = useCallback(async (query: string) => {
    if (!isAuthenticated) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const results = searchTargets(query)
      setState(prev => ({
        ...prev,
        searchResults: results,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        searchResults: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }))
    }
  }, [isAuthenticated])

  // Select a target
  const selectTarget = useCallback(async (target: GalaxyTarget) => {
    if (!isAuthenticated) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const nearby = findNearbyTargets(
        target.coordinates.ra,
        target.coordinates.dec,
        searchRadius
      )

      setState(prev => ({
        ...prev,
        selectedTarget: target,
        nearbyTargets: nearby.filter(t => t.id !== target.id),
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to select target'
      }))
    }
  }, [isAuthenticated, searchRadius])

  // Get targets by category
  const getTargets = useCallback((category: string) => {
    if (!isAuthenticated) return []
    return getTargetsByCategory(category)
  }, [isAuthenticated])

  // Calculate target statistics
  const statistics = useMemo(() => {
    const targets = state.searchResults.length > 0 
      ? state.searchResults 
      : state.nearbyTargets

    return {
      totalCount: targets.length,
      categoryBreakdown: targets.reduce((acc, target) => {
        target.description.forEach(desc => {
          acc[desc] = (acc[desc] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>)
    }
  }, [state.searchResults, state.nearbyTargets])

  return {
    ...state,
    spectralData,
    isLoadingSpectral,
    searchGalaxies,
    selectTarget,
    getTargets,
    statistics
  }
}
