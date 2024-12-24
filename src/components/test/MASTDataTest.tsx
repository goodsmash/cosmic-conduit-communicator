import React, { useEffect, useState } from 'react'
import { useMASTAuth } from '@/hooks/useMASTAuth'
import { useMASTSearch } from '@/hooks/useMASTSearch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SUGGESTED_OBJECTS = [
  { name: 'M31', type: 'galaxy', ra: 10.6847, dec: 41.2687, description: 'Andromeda Galaxy' },
  { name: 'M87', type: 'galaxy', ra: 187.7059, dec: 12.3911, description: 'Supergiant elliptical galaxy' },
  { name: 'M104', type: 'galaxy', ra: 189.9977, dec: -11.6237, description: 'Sombrero Galaxy' },
  { name: 'M42', type: 'nebula', ra: 83.8221, dec: -5.3911, description: 'Orion Nebula' },
  { name: 'M13', type: 'cluster', ra: 250.4217, dec: 36.4613, description: 'Great Globular Cluster' }
]

export function MASTDataTest() {
  const { isAuthenticated, userProfile, error: authError } = useMASTAuth()
  const { search, data, isLoading, error: searchError, spectralData, getSpectralData } = useMASTSearch()
  
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState({
    objectType: 'galaxy',
    searchTerm: '',
    radius: '0.2'
  })

  useEffect(() => {
    if (isAuthenticated) {
      handleSearch()
    }
  }, [isAuthenticated])

  const handleSearch = async () => {
    try {
      console.log('Searching with params:', searchParams)
      await search({
        target: searchParams.searchTerm || undefined,
        objectTypes: [searchParams.objectType],
        radius: parseFloat(searchParams.radius),
        pageSize: 10
      })
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const handleSuggestedObjectClick = async (object: typeof SUGGESTED_OBJECTS[0]) => {
    setSearchParams({
      ...searchParams,
      objectType: object.type,
      searchTerm: object.name
    })
    
    try {
      await search({
        target: object.name,
        coordinates: {
          ra: object.ra,
          dec: object.dec
        },
        radius: 0.2,
        objectTypes: [object.type],
        pageSize: 10
      })
    } catch (error) {
      console.error('Suggested object search error:', error)
    }
  }

  const handleGetSpectralData = async (target: string) => {
    setSelectedTarget(target)
    try {
      await getSpectralData(target)
    } catch (error) {
      console.error('Spectral data error:', error)
    }
  }

  if (authError) {
    return (
      <Card className="m-4 p-4 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{authError}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Object Type</Label>
              <Select 
                value={searchParams.objectType}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, objectType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="galaxy">Galaxy</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                  <SelectItem value="nebula">Nebula</SelectItem>
                  <SelectItem value="cluster">Cluster</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search Term</Label>
              <Input 
                value={searchParams.searchTerm}
                onChange={(e) => setSearchParams(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Enter object name"
              />
            </div>
            <div className="space-y-2">
              <Label>Search Radius (degrees)</Label>
              <Input 
                type="number"
                value={searchParams.radius}
                onChange={(e) => setSearchParams(prev => ({ ...prev, radius: e.target.value }))}
                step="0.1"
                min="0.1"
              />
            </div>
          </div>
          <Button onClick={handleSearch} className="mt-4">
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Suggested Objects */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Objects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUGGESTED_OBJECTS.map((object) => (
              <Card 
                key={object.name} 
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSuggestedObjectClick(object)}
              >
                <CardContent className="p-4">
                  <h3 className="font-bold">{object.name}</h3>
                  <p className="text-sm text-muted-foreground">{object.description}</p>
                  <p className="text-sm">RA: {object.ra}° Dec: {object.dec}°</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {searchError ? (
              <p className="text-red-500">{searchError}</p>
            ) : data.length === 0 ? (
              <p>No results found. Try adjusting your search parameters.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.map((item) => (
                  <Card key={item.id} className="border p-4">
                    <CardHeader>
                      <CardTitle>{item.target}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><span className="font-semibold">Type:</span> {item.objectType}</p>
                        {item.coordinates && (
                          <p>
                            <span className="font-semibold">Coordinates:</span> RA {item.coordinates.ra.toFixed(4)}°, 
                            Dec {item.coordinates.dec.toFixed(4)}°
                          </p>
                        )}
                        <Button 
                          onClick={() => handleGetSpectralData(item.target)}
                          className="w-full mt-2"
                        >
                          Get Spectral Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spectral Data */}
      {selectedTarget && spectralData && (
        <Card>
          <CardHeader>
            <CardTitle>Spectral Data for {selectedTarget}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Data Points</h3>
                <p>Wavelength measurements: {spectralData.wavelength.length}</p>
                <p>Flux measurements: {spectralData.flux.length}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Spectral Lines</h3>
                <p>Emission lines: {spectralData.emissionLines.length}</p>
                <p>Absorption lines: {spectralData.absorptionLines.length}</p>
              </div>
              {(spectralData.temperature || spectralData.age || spectralData.metallicity) && (
                <div className="col-span-2">
                  <h3 className="font-semibold mb-2">Properties</h3>
                  {spectralData.temperature && <p>Temperature: {spectralData.temperature}K</p>}
                  {spectralData.age && <p>Age: {spectralData.age} Gyr</p>}
                  {spectralData.metallicity && <p>Metallicity: {spectralData.metallicity}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
