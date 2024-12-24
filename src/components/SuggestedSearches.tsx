import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface AstronomicalObject {
  name: string;
  type: string;
  ra?: number;
  dec?: number;
  description: string;
}

const POPULAR_OBJECTS: AstronomicalObject[] = [
  // Galaxies
  { name: 'M31', type: 'Galaxy', ra: 10.6847, dec: 41.2687, description: 'Andromeda Galaxy - Nearest major galaxy to the Milky Way' },
  { name: 'M87', type: 'Galaxy', ra: 187.7059, dec: 12.3911, description: 'Supergiant elliptical galaxy with famous black hole image' },
  { name: 'M104', type: 'Galaxy', ra: 189.9977, dec: -11.6237, description: 'Sombrero Galaxy' },
  
  // Nebulae
  { name: 'M42', type: 'Nebula', ra: 83.8221, dec: -5.3911, description: 'Orion Nebula - Nearest star-forming region' },
  { name: 'M57', type: 'Nebula', ra: 283.3962, dec: 33.0289, description: 'Ring Nebula - Famous planetary nebula' },
  { name: 'NGC 7293', type: 'Nebula', ra: 337.4083, dec: -20.8378, description: 'Helix Nebula - One of the nearest planetary nebulae' },
  
  // Star Clusters
  { name: 'M13', type: 'Globular Cluster', ra: 250.4217, dec: 36.4613, description: 'Great Globular Cluster in Hercules' },
  { name: 'M45', type: 'Open Cluster', ra: 56.75, dec: 24.1167, description: 'Pleiades - Famous open cluster' },
  { name: 'NGC 5139', type: 'Globular Cluster', ra: 201.6967, dec: -47.4792, description: 'Omega Centauri - Largest globular cluster' },
  
  // Interesting Stars
  { name: 'Betelgeuse', type: 'Star', ra: 88.7929, dec: 7.4069, description: 'Red supergiant star in Orion' },
  { name: 'Sirius', type: 'Star', ra: 101.2875, dec: -16.7161, description: 'Brightest star in Earth\'s night sky' },
  { name: 'Proxima Centauri', type: 'Star', ra: 217.4289, dec: -62.6795, description: 'Nearest star to our Solar System' },
  
  // Supernovae Remnants
  { name: 'M1', type: 'Supernova Remnant', ra: 83.6333, dec: 22.0167, description: 'Crab Nebula - Famous supernova remnant' },
  { name: 'Cassiopeia A', type: 'Supernova Remnant', ra: 350.85, dec: 58.815, description: 'Youngest known supernova remnant in Milky Way' },
  
  // Exotic Objects
  { name: 'Cygnus X-1', type: 'Black Hole', ra: 299.5903, dec: 35.2017, description: 'First discovered black hole candidate' },
  { name: 'PSR B1919+21', type: 'Pulsar', ra: 289.7583, dec: 21.4667, description: 'First discovered pulsar' },
  
  // Famous Deep Field Regions
  { name: 'Hubble Ultra Deep Field', type: 'Deep Field', ra: 53.1625, dec: -27.7914, description: 'Deepest visible-light image of cosmos' },
  { name: 'GOODS-South', type: 'Deep Field', ra: 53.1227, dec: -27.8067, description: 'Great Observatories Origins Deep Survey field' },
  
  // Exoplanet Host Stars
  { name: 'Kepler-186', type: 'Exoplanet System', ra: 298.7375, dec: 44.4500, description: 'Host to Earth-sized planet in habitable zone' },
  { name: 'TRAPPIST-1', type: 'Exoplanet System', ra: 346.6267, dec: -5.0414, description: 'System with 7 Earth-sized planets' }
];

const OBJECT_TYPES = [
  'Galaxies',
  'Nebulae',
  'Star Clusters',
  'Stars',
  'Supernova Remnants',
  'Black Holes',
  'Pulsars',
  'Deep Fields',
  'Exoplanet Systems'
];

interface SuggestedSearchesProps {
  onSelect: (object: AstronomicalObject) => void;
}

export function SuggestedSearches({ onSelect }: SuggestedSearchesProps) {
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  const filteredObjects = selectedType
    ? POPULAR_OBJECTS.filter(obj => obj.type.includes(selectedType))
    : POPULAR_OBJECTS;

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Popular Objects</h2>
      
      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          onClick={() => setSelectedType(null)}
          className="text-sm"
        >
          All
        </Button>
        {OBJECT_TYPES.map(type => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            onClick={() => setSelectedType(type)}
            className="text-sm"
          >
            {type}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObjects.map((object) => (
            <Card
              key={object.name}
              className="p-3 cursor-pointer hover:bg-accent"
              onClick={() => onSelect(object)}
            >
              <h3 className="font-bold">{object.name}</h3>
              <p className="text-sm text-muted-foreground">{object.type}</p>
              <p className="text-sm mt-1">{object.description}</p>
              {object.ra && object.dec && (
                <p className="text-xs text-muted-foreground mt-1">
                  RA: {object.ra.toFixed(4)}° Dec: {object.dec.toFixed(4)}°
                </p>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
