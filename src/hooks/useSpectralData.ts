import { useState, useEffect, useMemo } from 'react'
import { mastDataService } from '@/services/mastDataService'
import { useMASTAuth } from './useMASTAuth'

export interface SpectralLine {
  wavelength: number
  flux: number
  intensity: number
  element: string
  ionization?: number
}

export interface SpectralData {
  emissionLines: SpectralLine[]
  absorptionLines: SpectralLine[]
  continuum: Array<{ wavelength: number; flux: number }>
  dominantColor: string
  temperature?: number
  metallicity?: number
  redshift?: number
  age?: string
  signalToNoise: number
}

export interface SpectralDataState {
  spectralData: SpectralData | null
  isLoading: boolean
  error: string | null
}

const elementMap: Record<string, { color: string; name: string }> = {
  H: { color: '#ff0000', name: 'Hydrogen' },
  He: { color: '#ffa500', name: 'Helium' },
  O: { color: '#00ff00', name: 'Oxygen' },
  N: { color: '#0000ff', name: 'Nitrogen' },
  Fe: { color: '#ff00ff', name: 'Iron' },
  Ca: { color: '#00ffff', name: 'Calcium' },
  Na: { color: '#ffff00', name: 'Sodium' }
}

function calculateDominantColor(lines: SpectralLine[]): string {
  const colorContributions = lines.reduce((acc, line) => {
    const element = line.element.split(' ')[0]
    const elementInfo = elementMap[element]
    if (!elementInfo) return acc

    const color = elementInfo.color
    const intensity = line.intensity
    
    if (!acc[color]) acc[color] = 0
    acc[color] += intensity
    
    return acc
  }, {} as Record<string, number>)

  let maxIntensity = 0
  let dominantColor = '#ffffff'

  for (const [color, intensity] of Object.entries(colorContributions)) {
    if (intensity > maxIntensity) {
      maxIntensity = intensity
      dominantColor = color
    }
  }

  return dominantColor
}

function calculateTemperature(lines: SpectralLine[]): number | undefined {
  const hAlpha = lines.find(l => l.wavelength === 656.3)
  const hBeta = lines.find(l => l.wavelength === 486.1)
  
  if (!hAlpha || !hBeta) return undefined
  
  const balmerDecrement = hAlpha.flux / hBeta.flux
  return Math.round(10000 / Math.log(balmerDecrement))
}

function estimateAge(metallicity: number | undefined, temperature: number | undefined): string {
  if (!metallicity || !temperature) return 'Unknown'
  
  if (metallicity < -1) {
    return temperature > 8000 ? 'Very Old (>10 Gyr)' : 'Old (5-10 Gyr)'
  } else if (metallicity < 0) {
    return temperature > 7000 ? 'Intermediate (2-5 Gyr)' : 'Young-Intermediate (1-2 Gyr)'
  } else {
    return temperature > 6000 ? 'Young (0.5-1 Gyr)' : 'Very Young (<0.5 Gyr)'
  }
}

export function useSpectralData(targetName: string): SpectralDataState {
  const { isAuthenticated } = useMASTAuth()
  const [state, setState] = useState<SpectralDataState>({
    spectralData: null,
    isLoading: false,
    error: null
  })

  useEffect(() => {
    if (!isAuthenticated || !targetName) return

    const fetchSpectralData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      try {
        const data = await mastDataService.searchData({
          target: targetName,
          instruments: ['STIS', 'COS', 'FOS'],
          objectTypes: ['galaxy'],
          pageSize: 1
        })

        if (data.data.length === 0) {
          throw new Error('No spectral data found for this target')
        }

        const obsID = data.data[0].obsID
        const details = await mastDataService.getObservationDetails(obsID)
        
        // Process spectral lines
        const emissionLines = details.spectra.features
          .filter(f => f.type === 'emission')
          .map(f => ({
            wavelength: f.wavelength,
            flux: f.flux,
            intensity: f.intensity,
            element: f.element
          }))

        const absorptionLines = details.spectra.features
          .filter(f => f.type === 'absorption')
          .map(f => ({
            wavelength: f.wavelength,
            flux: f.flux,
            intensity: f.intensity,
            element: f.element
          }))

        const temperature = calculateTemperature(emissionLines)
        const metallicity = details.spectra.metallicity
        const age = estimateAge(metallicity, temperature)

        const spectralData: SpectralData = {
          emissionLines,
          absorptionLines,
          continuum: details.spectra.continuum,
          dominantColor: calculateDominantColor(emissionLines),
          temperature,
          metallicity,
          redshift: details.spectra.redshift,
          age,
          signalToNoise: details.spectra.signalToNoise
        }

        setState({
          spectralData,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch spectral data'
        }))
      }
    }

    fetchSpectralData()
  }, [targetName, isAuthenticated])

  return state
}

// Utility functions for spectral analysis
export const spectralUtils = {
  getEmissionLines: (data: SpectralData | null) => data?.emissionLines || [],
  getAbsorptionLines: (data: SpectralData | null) => data?.absorptionLines || [],
  getDominantColor: (data: SpectralData | null) => data?.dominantColor || '#ffffff',
  getTemperature: (data: SpectralData | null) => data?.temperature,
  getMetallicity: (data: SpectralData | null) => data?.metallicity,
  getRedshift: (data: SpectralData | null) => data?.redshift,
  getAge: (data: SpectralData | null) => data?.age,
  getSignalToNoise: (data: SpectralData | null) => data?.signalToNoise || 0
}
