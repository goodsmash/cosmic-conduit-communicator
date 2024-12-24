import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GalaxyTarget } from '@/data/targetCatalog'

interface RealGalaxyParticlesProps {
  galaxy: GalaxyTarget
  particleCount?: number
  colorScheme?: {
    inner: string
    outer: string
  }
  emissionIntensity?: number
  rotationSpeed?: number
}

export function RealGalaxyParticles({
  galaxy,
  particleCount = 10000,
  colorScheme = { inner: '#ff9900', outer: '#0066ff' },
  emissionIntensity = 1.5,
  rotationSpeed = 0.1
}: RealGalaxyParticlesProps) {
  const points = useRef<THREE.Points>(null)

  // Generate particles based on galaxy properties
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    // Calculate galaxy radius based on redshift (if available)
    const baseRadius = 5
    const galaxyRadius = baseRadius * (1 + Math.random())

    // Generate spiral arms
    const arms = 4
    const armOffset = 2 * Math.PI / arms
    
    for (let i = 0; i < particleCount; i++) {
      // Calculate spiral position
      const t = i / particleCount
      const angle = t * Math.PI * 2 * 3 + Math.floor(t * arms) * armOffset
      const radius = t * galaxyRadius
      
      const x = Math.cos(angle) * radius
      const y = (Math.random() - 0.5) * radius * 0.2
      const z = Math.sin(angle) * radius

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Color based on distance from center (redder in center, bluer in arms)
      const distanceFromCenter = Math.sqrt(x * x + z * z)
      const normalizedDistance = distanceFromCenter / galaxyRadius

      // Base colors for different galaxy types
      let r = 0.8, g = 0.6, b = 0.4 // Default warm colors
      
      if (galaxy.description.includes('High-redshift galaxies')) {
        r = 0.9; g = 0.4; b = 0.3 // Redder for high-redshift
      } else if (galaxy.description.includes('Quasars')) {
        r = 0.3; g = 0.7; b = 0.9 // Bluer for quasars
      }

      // Apply color variation based on position
      const innerColor = hexToRgb(colorScheme.inner)
      const outerColor = hexToRgb(colorScheme.outer)
      colors[i * 3] = innerColor.r * (1 - normalizedDistance) + outerColor.r * normalizedDistance
      colors[i * 3 + 1] = innerColor.g * (1 - normalizedDistance) + outerColor.g * normalizedDistance
      colors[i * 3 + 2] = innerColor.b * (1 - normalizedDistance) + outerColor.b * normalizedDistance

      // Vary particle sizes
      sizes[i] = Math.random() * 2 + 1
    }

    return [positions, colors, sizes]
  }, [galaxy, particleCount, colorScheme])

  // Animation
  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}
