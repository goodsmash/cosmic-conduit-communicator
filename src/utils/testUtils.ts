import { AstronomicalObject } from './astronomyUtils';

export const mockAstronomicalData: AstronomicalObject[] = [
  {
    id: 'M31',
    name: 'Andromeda Galaxy',
    ra: '00:42:44.3',
    dec: '+41:16:09',
    type: 'Galaxy',
    description: 'The nearest major galaxy to the Milky Way',
    image: '/images/andromeda.jpg',
    tags: ['galaxy', 'local group', 'spiral'],
    magnitude: 3.44,
    distance: 2537000,
    spectralType: 'Sb',
    observationHistory: [
      {
        date: '2024-01-01',
        observer: 'Test Observer',
        conditions: 'Clear',
        notes: 'Test observation'
      }
    ],
    relatedObjects: ['M32', 'M110'],
    lastUpdated: '2024-01-01'
  },
  {
    id: 'M42',
    name: 'Orion Nebula',
    ra: '05:35:17.3',
    dec: '-05:23:28',
    type: 'Nebula',
    description: 'A diffuse nebula in the Milky Way',
    image: '/images/orion.jpg',
    tags: ['nebula', 'emission', 'star formation'],
    magnitude: 4.0,
    distance: 1344,
    spectralType: 'N/A',
    observationHistory: [
      {
        date: '2024-01-01',
        observer: 'Test Observer',
        conditions: 'Clear',
        notes: 'Test observation'
      }
    ],
    relatedObjects: ['Trapezium Cluster'],
    lastUpdated: '2024-01-01'
  }
];

export const mockSearchResults = {
  objects: mockAstronomicalData,
  statistics: {
    totalObjects: 2,
    averageMagnitude: 3.72,
    brightestObject: 'Andromeda Galaxy',
    faintestObject: 'Orion Nebula',
    northernObjects: 1,
    southernObjects: 1,
    typeDistribution: {
      Galaxy: 1,
      Nebula: 1
    },
    densityMap: []
  },
  categories: {
    byType: {
      Galaxy: 1,
      Nebula: 1
    },
    byTag: {
      galaxy: 1,
      nebula: 1,
      'star formation': 1
    },
    byConstellation: {
      Andromeda: 1,
      Orion: 1
    },
    byBrightnessRange: {
      '3-4': 1,
      '4-5': 1
    }
  },
  recommendations: [
    'Consider observing M31 (Andromeda Galaxy) during fall months for best visibility',
    'The Orion Nebula is best viewed during winter months'
  ]
};
