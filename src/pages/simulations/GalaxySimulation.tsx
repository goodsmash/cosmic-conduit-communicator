"use client"

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise, DepthOfField } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Advanced vertex shader for galaxy particles with improved noise and movement
const galaxyVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  attribute float alpha;
  attribute float rotationSpeed;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDistance;
  uniform float uTime;
  
  // Enhanced noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m * m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vColor = customColor;
    vAlpha = alpha;
    vec3 pos = position;
    vDistance = length(pos.xz);
    
    // Dynamic rotation and movement
    float angle = atan(pos.x, pos.z);
    float radius = length(pos.xz);
    float timeOffset = uTime * rotationSpeed;
    
    // Add complex movement patterns
    float noise1 = snoise(vec2(pos.x * 0.02 + timeOffset, pos.z * 0.02)) * 0.2;
    float noise2 = snoise(vec2(pos.y * 0.02 + timeOffset, radius * 0.02)) * 0.2;
    
    float newAngle = angle + (1.0 / (radius + 0.1)) * timeOffset + noise1;
    pos.x = radius * sin(newAngle);
    pos.z = radius * cos(newAngle);
    pos.y += noise2;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

// Advanced fragment shader with enhanced visual effects
const galaxyFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDistance;
  uniform sampler2D uTexture;
  uniform float uTime;
  
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    
    // Enhanced glow effect
    float glow = pow(1.0 - dist, 3.0);
    vec3 glowColor = vColor * glow;
    
    // Dynamic color variation
    float colorPulse = sin(uTime * 2.0 + vDistance) * 0.1 + 0.9;
    vec3 finalColor = vColor * colorPulse;
    
    // Chromatic aberration
    float aberration = 0.02 * sin(uTime * 0.5);
    vec2 uvR = uv * (1.0 + aberration);
    vec2 uvB = uv * (1.0 - aberration);
    
    vec3 color = vec3(
      texture2D(uTexture, vec2(0.5) + uvR).r,
      texture2D(uTexture, vec2(0.5) + uv).g,
      texture2D(uTexture, vec2(0.5) + uvB).b
    );
    
    color *= finalColor;
    color += glowColor * 0.5;
    
    float alpha = texture2D(uTexture, gl_PointCoord).a * vAlpha * (1.0 - dist * 2.0);
    gl_FragColor = vec4(color, alpha);
  }
`

function createStarTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Create multi-layered gradient for more realistic star appearance
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(255, 240, 220, 0.8)')
  gradient.addColorStop(0.4, 'rgba(255, 220, 180, 0.4)')
  gradient.addColorStop(0.8, 'rgba(180, 120, 60, 0.1)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)

  return new THREE.CanvasTexture(canvas)
}

interface GalaxyParams {
  count?: number
  galaxyType?: 'spiral' | 'elliptical' | 'irregular' | 'ring' | 'barredSpiral'
  colorScheme?: {
    inner: string
    outer: string
  }
  rotationSpeed?: number
  spiralTightness?: number
  particleSize?: number
  bloomIntensity?: number
  effectsIntensity?: number
  depthOfField?: boolean
  dofFocus?: number
  motionBlur?: boolean
  showStars?: boolean
  cameraView?: string
  interactionMode?: 'orbit' | 'fly' | 'firstPerson'
  autoRotate?: boolean
}

const galaxyPresets = {
  'milkyWay': {
    type: 'barredSpiral',
    colorScheme: { inner: '#ffaa44', outer: '#4477ff' },
    rotationSpeed: 0.8,
    spiralTightness: 1.0,
    particleSize: 1.0,
    bloomIntensity: 1.5,
    effectsIntensity: 1.0
  },
  'andromeda': {
    type: 'spiral',
    colorScheme: { inner: '#ff7700', outer: '#2255ff' },
    rotationSpeed: 0.6,
    spiralTightness: 1.2,
    particleSize: 1.2,
    bloomIntensity: 1.8,
    effectsIntensity: 1.2
  },
  'cartwheel': {
    type: 'ring',
    colorScheme: { inner: '#ff5500', outer: '#00aaff' },
    rotationSpeed: 1.0,
    spiralTightness: 0.5,
    particleSize: 1.5,
    bloomIntensity: 2.0,
    effectsIntensity: 1.5
  },
  'largemagellanic': {
    type: 'irregular',
    colorScheme: { inner: '#ffcc00', outer: '#66aaff' },
    rotationSpeed: 1.2,
    spiralTightness: 0.8,
    particleSize: 1.3,
    bloomIntensity: 1.6,
    effectsIntensity: 1.3
  }
}

function GalaxyControls({ params, setParams }: { 
  params: GalaxyParams, 
  setParams: (params: GalaxyParams) => void 
}) {
  const [preset, setPreset] = useState('custom')

  const handlePresetChange = (value: string) => {
    if (value === 'custom') return
    const presetParams = galaxyPresets[value as keyof typeof galaxyPresets]
    setParams({
      ...params,
      galaxyType: presetParams.type as GalaxyParams['galaxyType'],
      colorScheme: presetParams.colorScheme,
      rotationSpeed: presetParams.rotationSpeed,
      spiralTightness: presetParams.spiralTightness,
      particleSize: presetParams.particleSize,
      bloomIntensity: presetParams.bloomIntensity,
      effectsIntensity: presetParams.effectsIntensity
    })
    setPreset(value)
  }

  return (
    <Card className="absolute top-4 left-4 p-4 bg-background/80 backdrop-blur-md w-80 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Galaxy Configuration</h2>
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="milkyWay">Milky Way</SelectItem>
            <SelectItem value="andromeda">Andromeda</SelectItem>
            <SelectItem value="cartwheel">Cartwheel Galaxy</SelectItem>
            <SelectItem value="largemagellanic">Large Magellanic Cloud</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Galaxy Type</label>
          <Select 
            value={params.galaxyType} 
            onValueChange={(value) => setParams({ ...params, galaxyType: value as GalaxyParams['galaxyType'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spiral">Spiral</SelectItem>
              <SelectItem value="barredSpiral">Barred Spiral</SelectItem>
              <SelectItem value="elliptical">Elliptical</SelectItem>
              <SelectItem value="irregular">Irregular</SelectItem>
              <SelectItem value="ring">Ring</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Rotation Speed</label>
          <Slider 
            value={[params.rotationSpeed || 1]}
            min={0.1}
            max={2.0}
            step={0.1}
            onValueChange={([value]) => setParams({ ...params, rotationSpeed: value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Spiral Tightness</label>
          <Slider 
            value={[params.spiralTightness || 1]}
            min={0.5}
            max={2.0}
            step={0.1}
            onValueChange={([value]) => setParams({ ...params, spiralTightness: value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Particle Size</label>
          <Slider 
            value={[params.particleSize || 1]}
            min={0.5}
            max={2.0}
            step={0.1}
            onValueChange={([value]) => setParams({ ...params, particleSize: value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Bloom Intensity</label>
          <Slider 
            value={[params.bloomIntensity || 1.5]}
            min={0.5}
            max={3.0}
            step={0.1}
            onValueChange={([value]) => setParams({ ...params, bloomIntensity: value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Effects Intensity</label>
          <Slider 
            value={[params.effectsIntensity || 1]}
            min={0.5}
            max={2.0}
            step={0.1}
            onValueChange={([value]) => setParams({ ...params, effectsIntensity: value })}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button 
          className="w-full"
          onClick={() => setPreset('custom')}
        >
          Reset to Custom
        </Button>
      </div>
    </Card>
  )
}

function CameraController({ target = new THREE.Vector3(), ...props }) {
  const { camera } = useThree()
  const [currentView, setCurrentView] = useState('default')
  
  const views = {
    default: { pos: [0, 2, 5], target: [0, 0, 0] },
    top: { pos: [0, 10, 0], target: [0, 0, 0] },
    side: { pos: [8, 0, 0], target: [0, 0, 0] },
    closeup: { pos: [0, 0.5, 2], target: [0, 0, 0] }
  }

  const lerp = (start: number[], end: number[], alpha: number) => {
    return start.map((s, i) => s + (end[i] - s) * alpha)
  }

  useFrame((state, delta) => {
    if (currentView !== props.view) {
      setCurrentView(props.view)
      const view = views[props.view as keyof typeof views]
      const newPos = lerp(
        [camera.position.x, camera.position.y, camera.position.z],
        view.pos,
        delta * 2
      )
      const newTarget = lerp(
        [target.x, target.y, target.z],
        view.target,
        delta * 2
      )
      
      camera.position.set(newPos[0], newPos[1], newPos[2])
      target.set(newTarget[0], newTarget[1], newTarget[2])
      camera.lookAt(target)
    }
  })

  return null
}

interface InteractionState {
  mode: 'orbit' | 'fly' | 'firstPerson'
  speed: number
  autoRotate: boolean
}

function InteractionController({ state, setState }: { 
  state: InteractionState,
  setState: (state: InteractionState) => void 
}) {
  const { camera, gl } = useThree()
  const controls = useRef<any>()

  useEffect(() => {
    if (controls.current) {
      controls.current.autoRotate = state.autoRotate
      controls.current.enableRotate = state.mode === 'orbit'
      controls.current.enableZoom = state.mode !== 'firstPerson'
      controls.current.enablePan = state.mode === 'orbit'
      
      if (state.mode === 'firstPerson') {
        camera.position.y = 0.5
        controls.current.target.copy(camera.position)
        controls.current.target.z -= 1
      }
    }
  }, [state.mode, state.autoRotate, camera])

  useFrame((state, delta) => {
    if (controls.current) {
      controls.current.update()
      
      if (state.mode === 'fly') {
        // Add fly mode controls
        const speed = state.speed * delta
        if (keyboard.forward) camera.translateZ(-speed)
        if (keyboard.backward) camera.translateZ(speed)
        if (keyboard.left) camera.translateX(-speed)
        if (keyboard.right) camera.translateX(speed)
        if (keyboard.up) camera.translateY(speed)
        if (keyboard.down) camera.translateY(-speed)
      }
    }
  })

  return (
    <OrbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      maxPolarAngle={Math.PI * 0.8}
    />
  )
}

function VisualEffectsController({ params, setParams }: {
  params: GalaxyParams,
  setParams: (params: GalaxyParams) => void
}) {
  return (
    <Card className="absolute top-4 right-4 p-4 bg-background/80 backdrop-blur-md w-80 space-y-4">
      <h2 className="text-lg font-semibold mb-2">Visual Effects</h2>
      
      <Tabs defaultValue="effects">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="camera">Camera</TabsTrigger>
        </TabsList>
        
        <TabsContent value="effects" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Depth of Field</label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable</span>
              <Switch
                checked={params.depthOfField}
                onCheckedChange={(checked) => 
                  setParams({ ...params, depthOfField: checked })
                }
              />
            </div>
            {params.depthOfField && (
              <Slider
                value={[params.dofFocus || 2]}
                min={0.1}
                max={10}
                step={0.1}
                onValueChange={([value]) => 
                  setParams({ ...params, dofFocus: value })
                }
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Motion Blur</label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable</span>
              <Switch
                checked={params.motionBlur}
                onCheckedChange={(checked) => 
                  setParams({ ...params, motionBlur: checked })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Star Field</label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable</span>
              <Switch
                checked={params.showStars}
                onCheckedChange={(checked) => 
                  setParams({ ...params, showStars: checked })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="camera" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Camera View</label>
            <Select
              value={params.cameraView}
              onValueChange={(value) => 
                setParams({ ...params, cameraView: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default View</SelectItem>
                <SelectItem value="top">Top View</SelectItem>
                <SelectItem value="side">Side View</SelectItem>
                <SelectItem value="closeup">Close-up View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Interaction Mode</label>
            <Select
              value={params.interactionMode}
              onValueChange={(value) => 
                setParams({ ...params, interactionMode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orbit">Orbit Controls</SelectItem>
                <SelectItem value="fly">Fly Mode</SelectItem>
                <SelectItem value="firstPerson">First Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Auto Rotate</label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable</span>
              <Switch
                checked={params.autoRotate}
                onCheckedChange={(checked) => 
                  setParams({ ...params, autoRotate: checked })
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

function GalaxyParticles({ 
  count = 500000, 
  galaxyType = 'spiral', 
  colorScheme = { inner: '#ff9900', outer: '#0066ff' },
  rotationSpeed = 1,
  spiralTightness = 1,
  particleSize = 1,
  effectsIntensity = 1
}: GalaxyParams) {
  const particles = useRef()
  const { clock } = useThree()
  const texture = useMemo(() => createStarTexture(), [])

  const [positions, colors, sizes, alphas, rotationSpeeds] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const alphas = new Float32Array(count)
    const rotationSpeeds = new Float32Array(count)

    const innerColor = new THREE.Color(colorScheme.inner)
    const outerColor = new THREE.Color(colorScheme.outer)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      let radius, spinAngle, branchAngle, randomX, randomY, randomZ

      switch (galaxyType) {
        case 'barredSpiral':
          radius = Math.random() * 2.5 + 0.1
          spinAngle = radius * 4
          branchAngle = (i % 2) * Math.PI
          // Add bar effect
          if (radius < 0.8) {
            positions[i3] = (Math.random() - 0.5) * 1.5
            positions[i3 + 1] = (Math.random() - 0.5) * 0.2
            positions[i3 + 2] = (Math.random() - 0.5) * 0.4
          } else {
            randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius
            randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3
            randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius
            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
            positions[i3 + 1] = randomY
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ
          }
          break

        case 'elliptical':
          radius = Math.cbrt(Math.random()) * 2
          spinAngle = Math.random() * Math.PI * 2
          randomX = Math.random() * 2 - 1
          randomY = Math.random() * 2 - 1
          randomZ = Math.random() * 2 - 1
          positions[i3] = radius * Math.sin(spinAngle) * Math.cos(randomY * Math.PI)
          positions[i3 + 1] = radius * Math.sin(randomX * Math.PI) * 0.6
          positions[i3 + 2] = radius * Math.cos(spinAngle) * Math.cos(randomZ * Math.PI)
          break

        case 'irregular':
          const clusterCount = 5
          const clusterIndex = Math.floor(Math.random() * clusterCount)
          const clusterOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
          )
          positions[i3] = clusterOffset.x + (Math.random() - 0.5) * 2
          positions[i3 + 1] = clusterOffset.y + (Math.random() - 0.5) * 2
          positions[i3 + 2] = clusterOffset.z + (Math.random() - 0.5) * 2
          break

        case 'ring':
          radius = 1.8 + Math.random() * 0.4
          spinAngle = Math.random() * Math.PI * 2
          const ringWidth = Math.random() * 0.4 - 0.2
          positions[i3] = Math.cos(spinAngle) * (radius + ringWidth)
          positions[i3 + 1] = (Math.random() - 0.5) * 0.2
          positions[i3 + 2] = Math.sin(spinAngle) * (radius + ringWidth)
          break

        default: // spiral
          radius = Math.random() * 2.5 + 0.1
          spinAngle = radius * 5
          branchAngle = (i % 4) * ((2 * Math.PI) / 4)
          randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius
          randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3
          randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius
          positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
          positions[i3 + 1] = randomY
          positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ
      }

      // Calculate color based on distance from center
      const distanceFromCenter = Math.sqrt(
        positions[i3] * positions[i3] + 
        positions[i3 + 1] * positions[i3 + 1] + 
        positions[i3 + 2] * positions[i3 + 2]
      )
      const colorMix = Math.min(distanceFromCenter / 2.5, 1)
      const mixedColor = innerColor.clone().lerp(outerColor, colorMix)
      
      colors[i3] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b

      // Vary sizes and alphas based on position and galaxy type
      sizes[i] = Math.random() * 2.5 + 0.1
      if (galaxyType === 'irregular') {
        sizes[i] *= 1.5
      }

      alphas[i] = Math.random() * 0.5 + 0.5
      rotationSpeeds[i] = (Math.random() * 0.5 + 0.5) * (1 / (distanceFromCenter + 0.1))
    }

    // Modify particle attributes based on new parameters
    for (let i = 0; i < count; i++) {
      sizes[i] *= particleSize
      rotationSpeeds[i] *= rotationSpeed
    }

    return [positions, colors, sizes, alphas, rotationSpeeds]
  }, [count, galaxyType, colorScheme, rotationSpeed, spiralTightness, particleSize])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    particles.current.rotation.y = time * 0.05
    particles.current.material.uniforms.uTime.value = time
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
          uTime: { value: 0 },
          uTexture: { value: texture }
        }}
      />
    </points>
  )
}

function GalaxyEnvironment({ showStars = true }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      {showStars && (
        <Stars
          radius={300}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}
    </>
  )
}

export default function GalaxySimulation() {
  const [params, setParams] = useState<GalaxyParams & {
    depthOfField?: boolean
    dofFocus?: number
    motionBlur?: boolean
    showStars?: boolean
    cameraView?: string
    interactionMode?: 'orbit' | 'fly' | 'firstPerson'
    autoRotate?: boolean
  }>({
    galaxyType: 'spiral',
    colorScheme: { inner: '#ff9900', outer: '#0066ff' },
    rotationSpeed: 1,
    spiralTightness: 1,
    particleSize: 1,
    bloomIntensity: 1.5,
    effectsIntensity: 1,
    depthOfField: false,
    dofFocus: 2,
    motionBlur: false,
    showStars: true,
    cameraView: 'default',
    interactionMode: 'orbit',
    autoRotate: false
  })

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 75, near: 0.1, far: 1000 }}>
        <color attach="background" args={['#000008']} />
        <CameraController view={params.cameraView} />
        <GalaxyEnvironment showStars={params.showStars} />
        <GalaxyParticles {...params} />
        <InteractionController 
          state={{
            mode: params.interactionMode || 'orbit',
            speed: 1,
            autoRotate: params.autoRotate || false
          }}
          setState={(state) => setParams({ 
            ...params, 
            interactionMode: state.mode,
            autoRotate: state.autoRotate 
          })}
        />
        <EffectComposer>
          <Bloom 
            intensity={params.bloomIntensity || 1.5}
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
            height={300}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0005 * (params.effectsIntensity || 1), 0.0005 * (params.effectsIntensity || 1)]}
          />
          <Noise opacity={0.02 * (params.effectsIntensity || 1)} />
          {params.depthOfField && (
            <DepthOfField
              focusDistance={params.dofFocus || 0}
              focalLength={0.02}
              bokehScale={2}
              height={480}
            />
          )}
        </EffectComposer>
      </Canvas>
      <GalaxyControls params={params} setParams={setParams} />
      <VisualEffectsController params={params} setParams={setParams} />
    </div>
  )
}
