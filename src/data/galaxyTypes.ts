import { Vector3 } from 'three';

export interface GalaxyParameters {
  size: number;
  armCount: number;
  dustDensity: number;
  starFormationRate: number;
  rotationSpeed: number;
  particleCount: number;
  spiralTightness: number;
}

export interface GalaxyColors {
  core: string;
  arms: string;
  dust: string;
  starFormation: string;
  accent: string;
}

export interface GalaxyType {
  id: string;
  name: string;
  type: 'spiral' | 'elliptical' | 'irregular' | 'merger' | 'lenticular' | 'ring';
  description: string;
  scientificName?: string;
  color: GalaxyColors;
  parameters: GalaxyParameters;
  characteristics: string[];
  realWorldExample?: string;
  position?: Vector3;
}

export const galaxyTypes: GalaxyType[] = [
  {
    id: 'milky-way-like',
    name: 'Milky Way-like Spiral',
    type: 'spiral',
    scientificName: 'SBbc',
    description: 'A grand design spiral galaxy with prominent arms and active star formation regions, similar to our own Milky Way.',
    color: {
      core: '#ffdb8c',
      arms: '#ff6b6b',
      dust: '#4a90e2',
      starFormation: '#ff4757',
      accent: '#ffd700'
    },
    parameters: {
      size: 50,
      armCount: 4,
      dustDensity: 0.5,
      starFormationRate: 0.7,
      rotationSpeed: 0.0005,
      particleCount: 100000,
      spiralTightness: 0.3
    },
    characteristics: [
      'Four prominent spiral arms',
      'Active star formation in arms',
      'Dense galactic bulge',
      'Visible dust lanes',
      'Supermassive black hole at center'
    ],
    realWorldExample: 'NGC 1232'
  },
  {
    id: 'andromeda-like',
    name: 'Andromeda-like Galaxy',
    type: 'spiral',
    scientificName: 'SA(s)b',
    description: 'A massive spiral galaxy with a prominent bulge and tightly wound spiral arms, resembling our nearest large galactic neighbor.',
    color: {
      core: '#ffd700',
      arms: '#ff8f00',
      dust: '#2f3542',
      starFormation: '#ff6348',
      accent: '#ffa502'
    },
    parameters: {
      size: 65,
      armCount: 2,
      dustDensity: 0.6,
      starFormationRate: 0.5,
      rotationSpeed: 0.0004,
      particleCount: 120000,
      spiralTightness: 0.4
    },
    characteristics: [
      'Massive galactic halo',
      'Two primary spiral arms',
      'Rich in globular clusters',
      'Strong dust lanes',
      'Multiple satellite galaxies'
    ],
    realWorldExample: 'M31 (Andromeda)'
  },
  {
    id: 'antennae',
    name: 'Antennae Galaxies',
    type: 'merger',
    scientificName: 'NGC 4038/NGC 4039',
    description: 'A dramatic galaxy merger with intense star formation and long tidal tails of stars and gas.',
    color: {
      core: '#ffd700',
      arms: '#ff4757',
      dust: '#2f3542',
      starFormation: '#ff6348',
      accent: '#ff9ff3'
    },
    parameters: {
      size: 40,
      armCount: 2,
      dustDensity: 0.8,
      starFormationRate: 0.9,
      rotationSpeed: 0.0006,
      particleCount: 150000,
      spiralTightness: 0.1
    },
    characteristics: [
      'Spectacular tidal tails',
      'Intense star formation regions',
      'Chaotic structure',
      'Multiple interaction points',
      'High gas density'
    ],
    realWorldExample: 'NGC 4038/4039'
  },
  {
    id: 'm87-like',
    name: 'Supergiant Elliptical',
    type: 'elliptical',
    scientificName: 'E0',
    description: 'A massive elliptical galaxy with a supermassive black hole at its center, similar to M87.',
    color: {
      core: '#ffeaa7',
      arms: '#fab1a0',
      dust: '#636e72',
      starFormation: '#fd79a8',
      accent: '#81ecec'
    },
    parameters: {
      size: 80,
      armCount: 0,
      dustDensity: 0.2,
      starFormationRate: 0.1,
      rotationSpeed: 0.0002,
      particleCount: 200000,
      spiralTightness: 0
    },
    characteristics: [
      'Supermassive black hole',
      'Relativistic jet',
      'Old stellar population',
      'Smooth light distribution',
      'Low gas content'
    ],
    realWorldExample: 'M87'
  },
  {
    id: 'cartwheel',
    name: 'Ring Galaxy',
    type: 'ring',
    scientificName: 'R',
    description: 'A rare ring-shaped galaxy formed by a collision, featuring a bright outer ring of young stars.',
    color: {
      core: '#74b9ff',
      arms: '#00cec9',
      dust: '#2d3436',
      starFormation: '#55efc4',
      accent: '#81ecec'
    },
    parameters: {
      size: 45,
      armCount: 1,
      dustDensity: 0.4,
      starFormationRate: 0.8,
      rotationSpeed: 0.0004,
      particleCount: 90000,
      spiralTightness: 0
    },
    characteristics: [
      'Prominent outer ring',
      'Spokes of gas and dust',
      'Central nucleus',
      'Active star formation in ring',
      'Complex dynamics'
    ],
    realWorldExample: 'Cartwheel Galaxy'
  },
  {
    id: 'sombrero',
    name: 'Lenticular Galaxy',
    type: 'lenticular',
    scientificName: 'SA0',
    description: 'A galaxy with characteristics of both spiral and elliptical galaxies, featuring a prominent dust lane.',
    color: {
      core: '#dfe6e9',
      arms: '#b2bec3',
      dust: '#2d3436',
      starFormation: '#636e72',
      accent: '#a29bfe'
    },
    parameters: {
      size: 55,
      armCount: 0,
      dustDensity: 0.7,
      starFormationRate: 0.3,
      rotationSpeed: 0.0003,
      particleCount: 110000,
      spiralTightness: 0
    },
    characteristics: [
      'Prominent dust lane',
      'Large central bulge',
      'Depleted gas content',
      'Older stellar population',
      'Disk-like structure'
    ],
    realWorldExample: 'M104 (Sombrero)'
  },
  {
    id: 'grand-design-spiral',
    name: 'Grand Design Spiral',
    type: 'spiral',
    scientificName: 'SA(s)c',
    description: 'A perfect spiral galaxy with two well-defined, symmetrical arms wrapping around the galactic center.',
    color: {
      core: '#ffd700',
      arms: '#ff8f00',
      dust: '#2d3436',
      starFormation: '#ff6348',
      accent: '#ffa502'
    },
    parameters: {
      size: 55,
      armCount: 2,
      dustDensity: 0.6,
      starFormationRate: 0.8,
      rotationSpeed: 0.0004,
      particleCount: 110000,
      spiralTightness: 0.35
    },
    characteristics: [
      'Perfect symmetrical spiral structure',
      'Two dominant arms',
      'High star formation rate',
      'Well-defined dust lanes',
      'Prominent galactic bar'
    ],
    realWorldExample: 'M51 (Whirlpool Galaxy)'
  },
  {
    id: 'flocculent-spiral',
    name: 'Flocculent Spiral',
    type: 'spiral',
    scientificName: 'Sd',
    description: 'A spiral galaxy with many short, broken arm segments rather than well-defined spiral arms.',
    color: {
      core: '#ffeaa7',
      arms: '#fab1a0',
      dust: '#636e72',
      starFormation: '#fd79a8',
      accent: '#81ecec'
    },
    parameters: {
      size: 45,
      armCount: 6,
      dustDensity: 0.4,
      starFormationRate: 0.6,
      rotationSpeed: 0.0006,
      particleCount: 90000,
      spiralTightness: 0.25
    },
    characteristics: [
      'Multiple fragmentary arms',
      'Patchy star formation',
      'Less organized structure',
      'Moderate dust content',
      'Smaller central bulge'
    ],
    realWorldExample: 'NGC 2841'
  },
  {
    id: 'barred-spiral',
    name: 'Strong Barred Spiral',
    type: 'spiral',
    scientificName: 'SBa',
    description: 'A spiral galaxy with a prominent bar-shaped structure of stars through its center.',
    color: {
      core: '#74b9ff',
      arms: '#00cec9',
      dust: '#2d3436',
      starFormation: '#55efc4',
      accent: '#81ecec'
    },
    parameters: {
      size: 60,
      armCount: 2,
      dustDensity: 0.7,
      starFormationRate: 0.75,
      rotationSpeed: 0.0003,
      particleCount: 130000,
      spiralTightness: 0.4
    },
    characteristics: [
      'Strong central bar',
      'Arms emerge from bar ends',
      'Enhanced star formation at bar ends',
      'Prominent dust lanes along bar',
      'Rapid bar rotation'
    ],
    realWorldExample: 'NGC 1300'
  },
  {
    id: 'multi-arm-spiral',
    name: 'Multi-arm Spiral',
    type: 'spiral',
    scientificName: 'SAc',
    description: 'A spiral galaxy with multiple prominent arms, creating a complex and beautiful structure.',
    color: {
      core: '#dfe6e9',
      arms: '#b2bec3',
      dust: '#2d3436',
      starFormation: '#636e72',
      accent: '#a29bfe'
    },
    parameters: {
      size: 52,
      armCount: 5,
      dustDensity: 0.55,
      starFormationRate: 0.65,
      rotationSpeed: 0.0005,
      particleCount: 115000,
      spiralTightness: 0.3
    },
    characteristics: [
      'Multiple distinct spiral arms',
      'Complex arm branching',
      'Distributed star formation',
      'Moderate central bulge',
      'Rich in molecular clouds'
    ],
    realWorldExample: 'NGC 2997'
  },
  {
    id: 'giant-cD',
    name: 'Supergiant cD Galaxy',
    type: 'elliptical',
    scientificName: 'cD',
    description: 'A supermassive elliptical galaxy found at the centers of rich galaxy clusters, featuring an extended stellar halo.',
    color: {
      core: '#ffd700',
      arms: '#dfe4ea',
      dust: '#2f3542',
      starFormation: '#ff4757',
      accent: '#f1f2f6'
    },
    parameters: {
      size: 200,
      armCount: 0,
      dustDensity: 0.1,
      starFormationRate: 0.05,
      rotationSpeed: 0.0001,
      particleCount: 500000,
      spiralTightness: 0
    },
    characteristics: [
      'Extended stellar envelope',
      'Multiple merged galaxy cores',
      'Hot X-ray emitting gas',
      'Supermassive black hole > 10^10 solar masses',
      'Metal-rich stellar population',
      'Low star formation despite high mass',
      'Strong gravitational lensing effects'
    ],
    realWorldExample: 'NGC 6166 in Abell 2199'
  },
  {
    id: 'e0-spherical',
    name: 'Perfect Spherical Elliptical',
    type: 'elliptical',
    scientificName: 'E0',
    description: 'A perfectly spherical elliptical galaxy with minimal flattening, showing uniform stellar distribution.',
    color: {
      core: '#ffeaa7',
      arms: '#dfe6e9',
      dust: '#636e72',
      starFormation: '#fab1a0',
      accent: '#81ecec'
    },
    parameters: {
      size: 70,
      armCount: 0,
      dustDensity: 0.15,
      starFormationRate: 0.08,
      rotationSpeed: 0.0002,
      particleCount: 250000,
      spiralTightness: 0
    },
    characteristics: [
      'Perfect spherical symmetry',
      'Uniform stellar population',
      'Central black hole',
      'Old stellar population (>10 billion years)',
      'Minimal interstellar medium',
      'High velocity dispersion',
      'Strong X-ray emission from hot gas'
    ],
    realWorldExample: 'NGC 3379 (nearly E0)'
  },
  {
    id: 'e7-highly-elongated',
    name: 'Highly Elongated Elliptical',
    type: 'elliptical',
    scientificName: 'E7',
    description: 'A highly elongated elliptical galaxy representing the most flattened form of normal ellipticals.',
    color: {
      core: '#dfe6e9',
      arms: '#b2bec3',
      dust: '#2d3436',
      starFormation: '#636e72',
      accent: '#a29bfe'
    },
    parameters: {
      size: 85,
      armCount: 0,
      dustDensity: 0.2,
      starFormationRate: 0.06,
      rotationSpeed: 0.0003,
      particleCount: 300000,
      spiralTightness: 0
    },
    characteristics: [
      'Highly flattened structure',
      'Significant rotation',
      'Anisotropic velocity distribution',
      'Possible shell structures',
      'Evidence of past mergers',
      'Strong rotation support',
      'Dust lanes more common than in E0'
    ],
    realWorldExample: 'NGC 4697'
  },
  {
    id: 'shell-elliptical',
    name: 'Shell Elliptical Galaxy',
    type: 'elliptical',
    scientificName: 'E+S',
    description: 'An elliptical galaxy with concentric shells of stars, likely formed through galactic mergers.',
    color: {
      core: '#74b9ff',
      arms: '#00cec9',
      dust: '#2d3436',
      starFormation: '#55efc4',
      accent: '#81ecec'
    },
    parameters: {
      size: 90,
      armCount: 0,
      dustDensity: 0.25,
      starFormationRate: 0.07,
      rotationSpeed: 0.0002,
      particleCount: 350000,
      spiralTightness: 0
    },
    characteristics: [
      'Concentric stellar shells',
      'Ripple-like structures',
      'Evidence of recent merger',
      'Complex stellar dynamics',
      'Multiple stellar populations',
      'Asymmetric outer regions',
      'Enhanced metallicity in shells'
    ],
    realWorldExample: 'NGC 3923'
  },
  {
    id: 'box-elliptical',
    name: 'Box/Peanut Elliptical',
    type: 'elliptical',
    scientificName: 'EP',
    description: 'An elliptical galaxy with a distinctive box or peanut-shaped structure, often showing unique orbital configurations.',
    color: {
      core: '#ffeaa7',
      arms: '#fab1a0',
      dust: '#636e72',
      starFormation: '#fd79a8',
      accent: '#81ecec'
    },
    parameters: {
      size: 75,
      armCount: 0,
      dustDensity: 0.18,
      starFormationRate: 0.04,
      rotationSpeed: 0.0002,
      particleCount: 280000,
      spiralTightness: 0
    },
    characteristics: [
      'Box-shaped isophotes',
      'Triaxial structure',
      'Complex orbital families',
      'Central black hole',
      'Weak rotation',
      'Strong radial anisotropy',
      'X-shaped structure in edge-on view'
    ],
    realWorldExample: 'NGC 128'
  },
  {
    id: 'peculiar-starburst',
    name: 'Starburst Galaxy',
    type: 'irregular',
    scientificName: 'Irr P',
    description: 'A galaxy undergoing an exceptionally high rate of star formation, often triggered by interaction or rich gas content.',
    color: {
      core: '#ff6b6b',
      arms: '#ffd93d',
      dust: '#2d3436',
      starFormation: '#ff9f43',
      accent: '#ff4757'
    },
    parameters: {
      size: 40,
      armCount: 0,
      dustDensity: 0.9,
      starFormationRate: 1.0,
      rotationSpeed: 0.0008,
      particleCount: 180000,
      spiralTightness: 0
    },
    characteristics: [
      'Intense star formation regions',
      'High infrared luminosity',
      'Dense molecular clouds',
      'Strong emission lines',
      'Chaotic structure',
      'Powerful outflows',
      'High gas density'
    ],
    realWorldExample: 'M82 (Cigar Galaxy)'
  },
  {
    id: 'polar-ring',
    name: 'Polar Ring Galaxy',
    type: 'ring',
    scientificName: 'PRG',
    description: 'A rare type of galaxy with a ring of stars and gas orbiting in a plane perpendicular to the main galactic disk.',
    color: {
      core: '#81ecec',
      arms: '#00cec9',
      dust: '#2d3436',
      starFormation: '#74b9ff',
      accent: '#0984e3'
    },
    parameters: {
      size: 55,
      armCount: 1,
      dustDensity: 0.5,
      starFormationRate: 0.4,
      rotationSpeed: 0.0004,
      particleCount: 220000,
      spiralTightness: 0
    },
    characteristics: [
      'Perpendicular ring structure',
      'Two distinct rotation planes',
      'Evidence of galaxy interaction',
      'Unique dark matter distribution',
      'Complex dynamics',
      'Warped disk structure',
      'Active star formation in ring'
    ],
    realWorldExample: 'NGC 4650A'
  },
  {
    id: 'chain-galaxy',
    name: 'Chain Galaxy',
    type: 'irregular',
    scientificName: 'I0 pec',
    description: 'An extremely distant galaxy appearing as a chain of bright star-forming regions, often seen edge-on.',
    color: {
      core: '#ffeaa7',
      arms: '#fab1a0',
      dust: '#636e72',
      starFormation: '#fd79a8',
      accent: '#e17055'
    },
    parameters: {
      size: 70,
      armCount: 0,
      dustDensity: 0.7,
      starFormationRate: 0.85,
      rotationSpeed: 0.0003,
      particleCount: 260000,
      spiralTightness: 0
    },
    characteristics: [
      'Linear structure',
      'Multiple star-forming clumps',
      'High redshift',
      'Young stellar population',
      'Low metallicity',
      'Primitive morphology',
      'High gas fraction'
    ],
    realWorldExample: 'J1000+0221-C1'
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish Galaxy',
    type: 'irregular',
    scientificName: 'JW',
    description: 'A galaxy moving through dense intergalactic medium, creating trailing tentacles of gas and stars.',
    color: {
      core: '#74b9ff',
      arms: '#0984e3',
      dust: '#2d3436',
      starFormation: '#00cec9',
      accent: '#81ecec'
    },
    parameters: {
      size: 45,
      armCount: 0,
      dustDensity: 0.6,
      starFormationRate: 0.9,
      rotationSpeed: 0.0005,
      particleCount: 200000,
      spiralTightness: 0
    },
    characteristics: [
      'Extended gas tails',
      'Ram pressure stripping',
      'Enhanced star formation',
      'Asymmetric structure',
      'Blue stellar trails',
      'Compressed leading edge',
      'Multiple gas phases'
    ],
    realWorldExample: 'ESO 137-001'
  },
  {
    id: 'tadpole',
    name: 'Tadpole Galaxy',
    type: 'irregular',
    scientificName: 'I0 pec',
    description: 'A disrupted spiral galaxy with a long tail of stars, formed through a recent gravitational interaction.',
    color: {
      core: '#ffd700',
      arms: '#ff7675',
      dust: '#2d3436',
      starFormation: '#ff9f43',
      accent: '#fab1a0'
    },
    parameters: {
      size: 65,
      armCount: 1,
      dustDensity: 0.5,
      starFormationRate: 0.75,
      rotationSpeed: 0.0006,
      particleCount: 240000,
      spiralTightness: 0.1
    },
    characteristics: [
      'Long stellar tail',
      'Distorted spiral structure',
      'Active star formation',
      'Tidal debris',
      'Asymmetric disk',
      'Multiple star clusters',
      'Gas-rich system'
    ],
    realWorldExample: 'UGC 10214'
  },
  {
    id: 'seyfert-1',
    name: 'Seyfert Type 1 Galaxy',
    type: 'spiral',
    scientificName: 'Sy1',
    description: 'A spiral galaxy with an extremely bright and active nucleus, showing broad emission lines from rapidly moving gas near the central black hole.',
    color: {
      core: '#ffd700',
      arms: '#ff7675',
      dust: '#2d3436',
      starFormation: '#ff9f43',
      accent: '#74b9ff'
    },
    parameters: {
      size: 50,
      armCount: 2,
      dustDensity: 0.7,
      starFormationRate: 0.6,
      rotationSpeed: 0.0004,
      particleCount: 280000,
      spiralTightness: 0.3
    },
    characteristics: [
      'Extremely bright nucleus',
      'Broad emission lines',
      'Visible spiral structure',
      'Supermassive black hole activity',
      'High-velocity gas flows',
      'X-ray and UV emission',
      'Variable luminosity'
    ],
    realWorldExample: 'NGC 4151'
  },
  {
    id: 'blazer',
    name: 'Blazar Galaxy',
    type: 'elliptical',
    scientificName: 'BL Lac',
    description: 'An extremely energetic active galaxy with a relativistic jet pointed directly toward Earth, showing rapid variability.',
    color: {
      core: '#0984e3',
      arms: '#74b9ff',
      dust: '#2d3436',
      starFormation: '#00cec9',
      accent: '#81ecec'
    },
    parameters: {
      size: 75,
      armCount: 0,
      dustDensity: 0.2,
      starFormationRate: 0.1,
      rotationSpeed: 0.0002,
      particleCount: 320000,
      spiralTightness: 0
    },
    characteristics: [
      'Relativistic jet toward Earth',
      'Rapid brightness variations',
      'High polarization',
      'Gamma-ray emission',
      'Superluminal motion',
      'Compact radio core',
      'Non-thermal spectrum'
    ],
    realWorldExample: 'BL Lacertae'
  },
  {
    id: 'ultra-diffuse',
    name: 'Ultra Diffuse Galaxy',
    type: 'elliptical',
    scientificName: 'UDG',
    description: 'An extremely low surface brightness galaxy with size similar to the Milky Way but far fewer stars, appearing almost transparent.',
    color: {
      core: '#dfe6e9',
      arms: '#b2bec3',
      dust: '#636e72',
      starFormation: '#81ecec',
      accent: '#74b9ff'
    },
    parameters: {
      size: 60,
      armCount: 0,
      dustDensity: 0.1,
      starFormationRate: 0.05,
      rotationSpeed: 0.0001,
      particleCount: 100000,
      spiralTightness: 0
    },
    characteristics: [
      'Very low surface brightness',
      'Large physical size',
      'Few stars',
      'High dark matter content',
      'Old stellar population',
      'Diffuse structure',
      'Low metallicity'
    ],
    realWorldExample: 'Dragonfly 44'
  },
  {
    id: 'radio-galaxy',
    name: 'Giant Radio Galaxy',
    type: 'elliptical',
    scientificName: 'FR II',
    description: 'A massive elliptical galaxy with enormous radio-emitting jets extending far beyond the visible galaxy.',
    color: {
      core: '#ffeaa7',
      arms: '#fab1a0',
      dust: '#2d3436',
      starFormation: '#ff7675',
      accent: '#fd79a8'
    },
    parameters: {
      size: 150,
      armCount: 0,
      dustDensity: 0.15,
      starFormationRate: 0.08,
      rotationSpeed: 0.0001,
      particleCount: 400000,
      spiralTightness: 0
    },
    characteristics: [
      'Extended radio lobes',
      'Powerful jets',
      'Massive black hole',
      'Hot X-ray halo',
      'Giant elliptical host',
      'Shock-heated gas',
      'Magnetic field structure'
    ],
    realWorldExample: 'Cygnus A'
  },
  {
    id: 'quasar-host',
    name: 'Quasar Host Galaxy',
    type: 'irregular',
    scientificName: 'QSO',
    description: 'A galaxy hosting an extremely luminous active nucleus that outshines its entire stellar population.',
    color: {
      core: '#74b9ff',
      arms: '#0984e3',
      dust: '#2d3436',
      starFormation: '#00cec9',
      accent: '#81ecec'
    },
    parameters: {
      size: 45,
      armCount: 0,
      dustDensity: 0.8,
      starFormationRate: 0.9,
      rotationSpeed: 0.0003,
      particleCount: 250000,
      spiralTightness: 0
    },
    characteristics: [
      'Super-luminous nucleus',
      'Broad absorption lines',
      'High redshift',
      'Intense UV emission',
      'Rapid evolution',
      'Host galaxy obscured',
      'Strong metal lines'
    ],
    realWorldExample: '3C 273'
  }
];

export const getGalaxyById = (id: string): GalaxyType | undefined => {
  return galaxyTypes.find(galaxy => galaxy.id === id);
};

export const getGalaxiesByType = (type: GalaxyType['type']): GalaxyType[] => {
  return galaxyTypes.filter(galaxy => galaxy.type === type);
};

export const getAllGalaxyTypes = (): string[] => {
  return Array.from(new Set(galaxyTypes.map(galaxy => galaxy.type)));
};
