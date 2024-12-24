import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Card } from '@/components/ui/card'
import { useMASTAuth } from '@/hooks/useMASTAuth'
import { useTargetSearch } from '@/hooks/useTargetSearch'
import { RealGalaxyParticles } from '@/components/three/RealGalaxyParticles'
import { GalaxyInfo } from '@/components/GalaxyInfo'
import { SpectralGraph } from '@/components/SpectralGraph'
import { SearchControls } from '@/components/galaxy/SearchControls'
import { GalaxySimulationLayout } from '@/components/layouts/GalaxySimulationLayout'
import { targetCategories } from '@/data/targetCatalog'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'

const PRESET_GALAXIES = [
  { id: 'M87', name: 'M87', type: 'Elliptical' },
  { id: 'M31', name: 'Andromeda', type: 'Spiral' },
  { id: 'M104', name: 'Sombrero', type: 'Spiral' },
  { id: 'M51', name: 'Whirlpool', type: 'Spiral' }
]

const realGalaxyData = {
  m87: {
    name: "M87",
    type: "Elliptical",
    distance: "53.5 million light-years",
    size: 120000, // light years
    mass: "6.5 trillion solar masses",
    colors: {
      core: '#ff9933',
      outer: '#3366ff',
      jet: '#66ffff'
    },
    features: {
      hasJet: true,
      jetLength: 5000, // light years
      supermassiveBlackHole: true
    },
    particleCount: 1000000
  },
  andromedaGalaxy: {
    name: "Andromeda (M31)",
    type: "Spiral",
    distance: "2.537 million light-years",
    size: 220000,
    mass: "1.5 trillion solar masses",
    colors: {
      core: '#ffcc66',
      arms: '#3399ff',
      dust: '#663300'
    },
    features: {
      spiralArms: 2,
      hasBar: false,
      dustLanes: true
    },
    particleCount: 800000
  },
  sombrero: {
    name: "Sombrero Galaxy (M104)",
    type: "Spiral",
    distance: "29.3 million light-years",
    size: 50000,
    mass: "800 billion solar masses",
    colors: {
      core: '#ffaa44',
      dust: '#442200',
      halo: '#2244ff'
    },
    features: {
      dustLane: true,
      prominentBulge: true,
      stellarHalo: true
    },
    particleCount: 600000
  },
  whirlpool: {
    name: "Whirlpool Galaxy (M51)",
    type: "Spiral",
    distance: "23 million light-years",
    size: 60000,
    mass: "160 billion solar masses",
    colors: {
      core: '#ffbb55',
      arms: '#44aaff',
      companion: '#ff7744'
    },
    features: {
      interacting: true,
      companionGalaxy: true,
      grandDesign: true
    },
    particleCount: 700000
  }
}

const galaxyVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  attribute float alpha;
  attribute float rotationSpeed;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  uniform float time;
  
  void main() {
    vColor = customColor;
    vAlpha = alpha;
    
    // Calculate rotation based on distance from center
    float distance = length(position.xz);
    float angle = time * rotationSpeed * (1.0 / (distance + 0.1));
    
    // Apply rotation
    vec3 pos = position;
    pos.x = position.x * cos(angle) - position.z * sin(angle);
    pos.z = position.x * sin(angle) + position.z * cos(angle);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const galaxyFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
    
    vec3 color = vColor;
    vec3 glow = vColor * 0.5 * pow(1.0 - length(gl_PointCoord - vec2(0.5, 0.5)), 3.0);
    
    gl_FragColor = vec4(color + glow, vAlpha);
  }
`

function GalaxyInfo({ galaxy }) {
  return (
    <Card className="absolute bottom-4 left-4 p-4 bg-background/80 backdrop-blur-md w-96">
      <h2 className="text-xl font-bold mb-2">{galaxy.name}</h2>
      <div className="space-y-2 text-sm">
        <p><span className="font-semibold">Type:</span> {galaxy.type}</p>
        <p><span className="font-semibold">Distance:</span> {galaxy.distance}</p>
        <p><span className="font-semibold">Size:</span> {galaxy.size.toLocaleString()} light-years</p>
        <p><span className="font-semibold">Mass:</span> {galaxy.mass}</p>
        
        <p><span className="font-semibold">Notable Features:</span></p>
        <ul className="list-disc list-inside pl-4">
          {Object.entries(galaxy.features).map(([key, value]) => (
            <li key={key}>
              {key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())}: {value.toString()}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function RealGalaxyParticles({ galaxy, particleCount }) {
  const particles = useRef()
  const { clock } = useThree()

  const [positions, colors, sizes, alphas, rotationSpeeds] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const alphas = new Float32Array(particleCount)
    const rotationSpeeds = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      let radius, angle, x, y, z

      if (galaxy.type === "Elliptical") {
        // Elliptical galaxy distribution
        radius = Math.pow(Math.random(), 2) * galaxy.size / 2000
        const phi = Math.random() * Math.PI * 2
        const theta = Math.acos(2 * Math.random() - 1)
        
        x = radius * Math.sin(theta) * Math.cos(phi)
        y = radius * Math.sin(theta) * Math.sin(phi) * 0.7 // Flatten slightly
        z = radius * Math.cos(theta) * 0.7
        
        // Add jet if the galaxy has one
        if (galaxy.features.hasJet && Math.random() < 0.1) {
          const jetLength = galaxy.features.jetLength / 1000
          const isPositiveJet = Math.random() < 0.5
          y = (isPositiveJet ? 1 : -1) * (Math.random() * jetLength)
          x *= 0.1
          z *= 0.1
        }
      } else {
        // Spiral galaxy distribution
        radius = Math.pow(Math.random(), 0.5) * galaxy.size / 2000
        const armCount = galaxy.features.spiralArms || 2
        angle = (i % armCount) * ((2 * Math.PI) / armCount)
        const spiralFactor = 5.0
        const rotation = radius * spiralFactor
        
        x = Math.cos(angle + rotation) * radius
        y = (Math.random() - 0.5) * (radius * 0.1)
        z = Math.sin(angle + rotation) * radius
        
        // Add dust lanes if present
        if (galaxy.features.dustLanes && Math.random() < 0.2) {
          y *= 0.1
        }
      }

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      // Apply real spectral colors
      let color = new THREE.Color(galaxy.colors.core)
      
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = Math.random() * 2 + 1
      alphas[i] = Math.random() * 0.5 + 0.5
      rotationSpeeds[i] = (Math.random() * 0.5 + 0.5) * (1 / (radius + 0.1))
    }

    return [positions, colors, sizes, alphas, rotationSpeeds]
  }, [galaxy, particleCount])

  useFrame(() => {
    const time = clock.getElapsedTime() * 0.1
    particles.current.material.uniforms.time.value = time
  })

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={['attributes', 'customColor']}
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={['attributes', 'size']}
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attachObject={['attributes', 'alpha']}
          count={alphas.length}
          array={alphas}
          itemSize={1}
        />
        <bufferAttribute
          attachObject={['attributes', 'rotationSpeed']}
          count={rotationSpeeds.length}
          array={rotationSpeeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={galaxyVertexShader}
        fragmentShader={galaxyFragmentShader}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        uniforms={{
          time: { value: 0 }
        }}
      />
    </points>
  )
}

export default function RealGalaxySimulation() {
  const { isAuthenticated, login } = useMASTAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  
  const {
    selectedTarget,
    searchResults,
    nearbyTargets,
    spectralData,
    isLoading,
    isLoadingSpectral,
    error,
    searchGalaxies,
    selectTarget,
    getTargets,
    statistics
  } = useTargetSearch({ searchRadius: 1.0 })

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchGalaxies(searchQuery)
    }
  }

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const targets = getTargets(category)
    if (targets.length > 0) {
      selectTarget(targets[0])
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please log in to access real galaxy data.</p>
          <Button onClick={login}>Log In</Button>
        </Card>
      </div>
    )
  }

  const visualization = (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {isLoading || isLoadingSpectral ? (
        <Loader />
      ) : (
        selectedTarget && spectralData && (
          <RealGalaxyParticles
            galaxy={selectedTarget}
            particleCount={10000}
            colorIntensity={1.2}
            emissionIntensity={1.5}
          />
        )
      )}
    </Canvas>
  )

  const searchControls = (
    <>
      <SearchControls
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        categories={targetCategories}
        searchResults={searchResults}
        nearbyTargets={nearbyTargets}
        selectedTarget={selectedTarget}
        isLoading={isLoading}
        error={error}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onTargetSelect={selectTarget}
      />

      {/* Statistics */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Statistics</h3>
        <div className="text-sm space-y-1">
          <p>Total Targets: {statistics.totalCount}</p>
          {Object.entries(statistics.categoryBreakdown).map(([category, count]) => (
            <p key={category}>{category}: {count}</p>
          ))}
        </div>
      </Card>
    </>
  )

  return (
    <GalaxySimulationLayout
      sidebar={searchControls}
      visualization={visualization}
      info={selectedTarget && <GalaxyInfo galaxy={selectedTarget} />}
      spectralData={
        spectralData && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Spectral Data</h3>
            <SpectralGraph 
              data={spectralData}
              width={550}
              height={200}
            />
          </div>
        )
      }
    />
  )
}
