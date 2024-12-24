import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useSpectralData } from '@/hooks/useSpectralData'
import { MASTDataProduct } from '@/services/mastDataService'

interface GalaxyInfoProps {
  galaxy: MASTDataProduct
}

interface SpectralFeature {
  name: string
  wavelength: number
  intensity: number
  description: string
}

const commonFeatures: Record<string, SpectralFeature> = {
  halpha: {
    name: 'Hα (Hydrogen-alpha)',
    wavelength: 656.3,
    intensity: 0,
    description: 'Indicates star formation regions'
  },
  hbeta: {
    name: 'Hβ (Hydrogen-beta)',
    wavelength: 486.1,
    intensity: 0,
    description: 'Used to measure extinction'
  },
  oiii: {
    name: '[OIII]',
    wavelength: 500.7,
    intensity: 0,
    description: 'Traces highly ionized regions'
  },
  nii: {
    name: '[NII]',
    wavelength: 658.4,
    intensity: 0,
    description: 'Indicates chemical abundance'
  }
}

export function GalaxyInfo({ galaxy }: GalaxyInfoProps) {
  const { spectralData, isLoading, error } = useSpectralData(galaxy.target)

  const spectralFeatures = useMemo(() => {
    if (!spectralData?.emissionLines) return []

    return Object.entries(commonFeatures).map(([key, feature]) => {
      const matchingLine = spectralData.emissionLines.find(
        line => Math.abs(line.wavelength - feature.wavelength) < 1
      )

      return {
        ...feature,
        intensity: matchingLine?.intensity || 0
      }
    }).filter(feature => feature.intensity > 0)
  }, [spectralData])

  const spectralProperties = useMemo(() => {
    if (!spectralData) return null

    return {
      temperature: spectralData.temperature || 'Unknown',
      metallicity: spectralData.metallicity || 'Unknown',
      redshift: spectralData.redshift || 'Unknown',
      age: spectralData.age || 'Unknown'
    }
  }, [spectralData])

  if (error) {
    return (
      <Card className="p-4 max-w-md">
        <h2 className="text-xl font-bold mb-2">{galaxy.target}</h2>
        <p className="text-red-500">Error loading spectral data: {error}</p>
      </Card>
    )
  }

  return (
    <Card className="p-4 max-w-md bg-background/90 backdrop-blur-md">
      <h2 className="text-xl font-bold mb-2">{galaxy.target}</h2>
      
      {/* Basic Information */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Basic Information</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Right Ascension:</div>
          <div>{galaxy.coordinates?.ra.toFixed(4)}°</div>
          <div>Declination:</div>
          <div>{galaxy.coordinates?.dec.toFixed(4)}°</div>
          <div>Data Rights:</div>
          <div>{galaxy.dataRights}</div>
          <div>Release Date:</div>
          <div>{new Date(galaxy.releaseDate).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Spectral Properties */}
      {isLoading ? (
        <div className="text-center py-4">Loading spectral data...</div>
      ) : spectralProperties && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Spectral Properties</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Temperature:</div>
            <div>{typeof spectralProperties.temperature === 'number' 
              ? `${spectralProperties.temperature.toLocaleString()}K`
              : spectralProperties.temperature}</div>
            <div>Metallicity:</div>
            <div>{spectralProperties.metallicity}</div>
            <div>Redshift:</div>
            <div>{typeof spectralProperties.redshift === 'number'
              ? spectralProperties.redshift.toFixed(4)
              : spectralProperties.redshift}</div>
            <div>Estimated Age:</div>
            <div>{spectralProperties.age}</div>
          </div>
        </div>
      )}

      {/* Emission Lines */}
      {spectralFeatures.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Emission Features</h3>
          <div className="space-y-2">
            {spectralFeatures.map(feature => (
              <div key={feature.name} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>{feature.name}</span>
                  <span>{feature.wavelength}nm</span>
                </div>
                <Progress value={feature.intensity * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Quality */}
      <div className="text-xs text-muted-foreground mt-4">
        <div>Instrument: {galaxy.instrument}</div>
        <div>Calibration Level: {galaxy.calibrationLevel}</div>
        <div>Object Type: {galaxy.objectType}</div>
      </div>
    </Card>
  )
}
