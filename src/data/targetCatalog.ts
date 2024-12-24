export interface GalaxyTarget {
  id: string
  name: string
  coordinates: {
    ra: number  // Right Ascension in degrees
    dec: number // Declination in degrees
  }
  category: string
  description: string[]
  comments?: string
  equinox: string
  spectralElements?: {
    grating: string
    filter: string
    readoutPattern: string
  }
}

export const highRedshiftTargets: GalaxyTarget[] = [
  {
    id: 'HB8903',
    name: 'HB8903',
    coordinates: {
      ra: 52.7765604,
      dec: -38.40124
    },
    category: 'Galaxy',
    description: ['Active galactic nuclei'],
    comments: 'Carniani et al. 2017',
    equinox: 'J2000'
  },
  {
    id: 'GN-108036',
    name: 'GN-108036',
    coordinates: {
      ra: 189.0946196,
      dec: 62.13551
    },
    category: 'Galaxy',
    description: ['High-redshift galaxies'],
    comments: 'Ono et. al 2012',
    equinox: 'J2000'
  },
  {
    id: 'CGG-z5',
    name: 'CGG-z5',
    coordinates: {
      ra: 214.8116421,
      dec: 52.83682
    },
    category: 'Galaxy',
    description: ['Emission line galaxies', 'High-redshift galaxies'],
    comments: 'CEERS NIRCam image in F115W filter',
    equinox: 'J2000'
  },
  {
    id: 'JADES-GS-53',
    name: 'JADES-GS-53.087-27.86',
    coordinates: {
      ra: 53.0873808,
      dec: -27.86034
    },
    category: 'Galaxy',
    description: ['High-redshift galaxies'],
    comments: 'coordinates from JADES',
    equinox: 'J2000'
  },
  {
    id: 'Z-001',
    name: 'Z-001',
    coordinates: {
      ra: 150.1807917,
      dec: 2.63108
    },
    category: 'Galaxy',
    description: ['High-redshift galaxies'],
    comments: 'Central UV clump',
    equinox: 'J2000'
  },
  {
    id: 'GN-z11',
    name: 'GN-z11',
    coordinates: {
      ra: 189.1060421,
      dec: 62.24204
    },
    category: 'Galaxy',
    description: ['Emission line galaxies', 'High-redshift galaxies', 'Lyman-break galaxies'],
    comments: 'Tacchella+2023',
    equinox: 'J2000',
    spectralElements: {
      grating: 'G395H',
      filter: 'F290LP',
      readoutPattern: 'NRSIRS2'
    }
  },
  {
    id: 'LAP1',
    name: 'LAP1',
    coordinates: {
      ra: 64.0456929,
      dec: -24.06011
    },
    category: 'Galaxy',
    description: ['Emission line galaxies', 'High-redshift galaxies'],
    comments: 'APT of ID 1908; target name in the APT: popIII',
    equinox: 'J2000',
    spectralElements: {
      grating: 'G395H',
      filter: 'F290LP',
      readoutPattern: 'NRSIRS2'
    }
  },
  {
    id: 'J0224-4711',
    name: 'QSOJ0224',
    coordinates: {
      ra: 36.1105833,
      dec: -47.19150
    },
    category: 'Galaxy',
    description: ['Quasars'],
    comments: 'From SIMBAD, IRCS coord J2000',
    equinox: 'J2000',
    spectralElements: {
      grating: 'G395H',
      filter: 'F290LP',
      readoutPattern: 'NRSIRS2'
    }
  },
  {
    id: 'J0859+0022',
    name: 'HSC J0859+0022',
    coordinates: {
      ra: 134.7799583,
      dec: 0.38219
    },
    category: 'Galaxy',
    description: ['Quasars'],
    comments: 'From SIMBAD, IRCS coord J2000',
    equinox: 'J2000',
    spectralElements: {
      grating: 'G395H',
      filter: 'F290LP',
      readoutPattern: 'NRSIRS2'
    }
  },
  {
    id: 'LAE2_GS10578',
    name: 'LAE2_GS10578',
    coordinates: {
      ra: 53.1648750,
      dec: -27.81492
    },
    category: 'Galaxy',
    description: ['Active galactic nuclei', 'High-redshift galaxies'],
    comments: 'Coordinates from APT of GS10578',
    equinox: 'J2000',
    spectralElements: {
      grating: 'G235H',
      filter: 'F170LP',
      readoutPattern: 'NRSIRS2'
    }
  },
  {
    id: 'MACS0647-JD1',
    name: 'MACS0647-JD1',
    coordinates: {
      ra: 101.9822675,
      dec: 70.24328
    },
    category: 'Galaxy',
    description: ['Emission line galaxies', 'High-redshift galaxies'],
    comments: 'Highest magnification lensed image from Hsiao et al. (2022)',
    equinox: 'J2000',
    spectralElements: {
      grating: 'G395M',
      filter: 'F290LP',
      readoutPattern: 'NRSIRS2'
    }
  },
  {
    id: 'DLA0817g',
    name: 'DLA0817g',
    coordinates: {
      ra: 124.4202833,
      dec: 13.86062
    },
    category: 'Galaxy',
    description: ['Emission line galaxies', 'High-redshift galaxies'],
    comments: '[CII] centroid from Neeleman+20',
    equinox: 'J2000'
  }
]

export const targetCategories = [
  'Active galactic nuclei',
  'High-redshift galaxies',
  'Emission line galaxies',
  'Quasars',
  'Lyman-break galaxies'
]

export function findNearbyTargets(ra: number, dec: number, radius: number = 1.0): GalaxyTarget[] {
  return highRedshiftTargets.filter(target => {
    const dRa = (target.coordinates.ra - ra) * Math.cos(dec * Math.PI / 180)
    const dDec = target.coordinates.dec - dec
    const distance = Math.sqrt(dRa * dRa + dDec * dDec)
    return distance <= radius
  })
}

export function searchTargets(query: string): GalaxyTarget[] {
  const lowerQuery = query.toLowerCase()
  return highRedshiftTargets.filter(target => 
    target.name.toLowerCase().includes(lowerQuery) ||
    target.description.some(desc => desc.toLowerCase().includes(lowerQuery)) ||
    target.category.toLowerCase().includes(lowerQuery)
  )
}

export function getTargetsByCategory(category: string): GalaxyTarget[] {
  return highRedshiftTargets.filter(target =>
    target.description.includes(category)
  )
}
