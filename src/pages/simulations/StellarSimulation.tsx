"use client"

import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { OrbitControls, Stars, useTexture } from '@react-three/drei'

// Advanced vertex shader for stellar particles
const stellarVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  attribute float alpha;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDistance;
  uniform float uTime;
  
  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vColor = customColor;
    vAlpha = alpha;
    vec3 pos = position;
    vDistance = length(pos);
    
    // Add dynamic movement based on stage
    float noise = snoise(vec3(pos.x * 0.1, pos.y * 0.1, uTime * 0.1)) * 0.2;
    pos += normalize(pos) * noise;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

// Advanced fragment shader for stellar particles
const stellarFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDistance;
  uniform sampler2D uTexture;
  uniform float uTime;
  
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    
    // Dynamic glow effect
    float glow = pow(1.0 - dist, 2.0);
    vec3 glowColor = vColor * glow;
    
    // Chromatic aberration
    float aberration = 0.02 * sin(uTime * 0.5);
    vec2 uvR = uv * (1.0 + aberration);
    vec2 uvB = uv * (1.0 - aberration);
    
    vec4 texColor = texture2D(uTexture, gl_PointCoord);
    float alpha = texColor.a * vAlpha * (1.0 - dist * 2.0);
    
    // Combine colors with chromatic aberration
    vec3 finalColor = vec3(
      texture2D(uTexture, vec2(0.5) + uvR).r,
      texture2D(uTexture, vec2(0.5) + uv).g,
      texture2D(uTexture, vec2(0.5) + uvB).b
    );
    
    finalColor *= vColor;
    finalColor += glowColor * 0.5;
    
    // Add pulsing effect
    float pulse = sin(uTime * 2.0 + vDistance) * 0.1 + 0.9;
    finalColor *= pulse;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`

// Create custom shader material
const createStellarMaterial = (texture: THREE.Texture) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: texture }
    },
    vertexShader: stellarVertexShader,
    fragmentShader: stellarFragmentShader,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });
};

interface StarStage {
  name: string;
  color: string;
  radius: number;
  temperature: number;
  lifetime: string;
  description: string;
  effects: {
    corona: boolean;
    pulsation: boolean;
    supernova: boolean;
    blackHole: boolean;
  };
}

const starStages: StarStage[] = [
  {
    name: "Protostar",
    color: "#FF8E72",
    radius: 3,
    temperature: 2000,
    lifetime: "~100,000 years",
    description: "A collapsing cloud of gas and dust, gradually heating up as it contracts.",
    effects: {
      corona: false,
      pulsation: true,
      supernova: false,
      blackHole: false
    }
  },
  {
    name: "Main Sequence",
    color: "#FFF4D6",
    radius: 1,
    temperature: 5778,
    lifetime: "~10 billion years",
    description: "A stable star fusing hydrogen into helium in its core, like our Sun.",
    effects: {
      corona: true,
      pulsation: false,
      supernova: false,
      blackHole: false
    }
  },
  {
    name: "Red Giant",
    color: "#FF4B3E",
    radius: 100,
    temperature: 3500,
    lifetime: "~1 billion years",
    description: "An aging star that has depleted its core hydrogen, expanding dramatically.",
    effects: {
      corona: true,
      pulsation: true,
      supernova: false,
      blackHole: false
    }
  },
  {
    name: "Supernova",
    color: "#73D2DE",
    radius: 200,
    temperature: 100000000,
    lifetime: "~seconds to minutes",
    description: "A catastrophic explosion marking the death of a massive star, enriching space with heavy elements.",
    effects: {
      corona: false,
      pulsation: false,
      supernova: true,
      blackHole: false
    }
  },
  {
    name: "Black Hole",
    color: "#000000",
    radius: 0.1,
    temperature: 0,
    lifetime: "eternal",
    description: "A region of extremely warped spacetime where gravity is so intense that nothing, not even light, can escape.",
    effects: {
      corona: false,
      pulsation: false,
      supernova: false,
      blackHole: true
    }
  }
];

const StellarSimulation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [composer, setComposer] = useState<EffectComposer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);
  const [currentStage, setCurrentStage] = useState<StarStage>(starStages[0]);
  const [starMesh, setStarMesh] = useState<THREE.Mesh | null>(null);
  const [particleSystem, setParticleSystem] = useState<THREE.Points | null>(null);
  const animationFrameId = useRef<number>();
  const time = useRef(0);

  // Create particle system with enhanced attributes
  const createParticleSystem = (stage: StarStage) => {
    const particleCount = 100000; // Increased particle count
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);

    const geometry = new THREE.BufferGeometry();
    const color = new THREE.Color(stage.color);

    for (let i = 0; i < particleCount; i++) {
      let radius, theta, phi;

      switch(stage.name) {
        case "Protostar":
          // Create accretion disk pattern
          radius = stage.radius * (1 + Math.random() * 0.5);
          theta = Math.random() * Math.PI * 2;
          phi = (Math.random() - 0.5) * 0.2 * Math.PI;
          break;
          
        case "Main Sequence":
          // Create solar corona pattern
          radius = stage.radius * (1.1 + Math.pow(Math.random(), 2) * 0.4);
          theta = Math.random() * Math.PI * 2;
          phi = Math.acos(2 * Math.random() - 1);
          break;
          
        case "Red Giant":
          // Create convective envelope pattern
          radius = stage.radius * (0.9 + Math.random() * 0.3);
          theta = Math.random() * Math.PI * 2;
          phi = Math.acos(2 * Math.random() - 1);
          // Add clumping for convection cells
          if (Math.random() > 0.7) {
            radius *= 1.2;
          }
          break;
          
        case "Supernova":
          // Create expanding shell pattern
          radius = stage.radius * (1.5 + Math.random() * 5);
          theta = Math.random() * Math.PI * 2;
          phi = Math.acos(2 * Math.random() - 1);
          break;
          
        default: // Black Hole
          // Create accretion disk pattern
          radius = stage.radius * (2 + Math.random() * 10);
          theta = Math.random() * Math.PI * 2;
          phi = (Math.random() - 0.5) * 0.3;
          break;
      }

      const i3 = i * 3;
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Add color variation based on radius and stage
      const colorVariation = Math.random() * 0.3 - 0.15;
      const radiusRatio = radius / (stage.radius * 2);
      colors[i3] = Math.max(0, Math.min(1, color.r + colorVariation));
      colors[i3 + 1] = Math.max(0, Math.min(1, color.g + colorVariation));
      colors[i3 + 2] = Math.max(0, Math.min(1, color.b + colorVariation));

      // Vary particle sizes based on stage and position
      sizes[i] = Math.random() * 2.5 + 0.5;
      if (stage.name === "Supernova") {
        sizes[i] *= 2;
      }

      // Vary alpha based on stage and position
      alphas[i] = Math.max(0.2, Math.min(1, (1 - radiusRatio) * 1.5));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const texture = new THREE.TextureLoader().load('/star.png');
    const material = createStellarMaterial(texture);
    
    return new THREE.Points(geometry, material);
  };

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    const { scene: newScene, camera: newCamera, renderer: newRenderer, controls: newControls } = 
      setupThreeScene(containerRef.current, [20, 10, 20]);

    // Setup post-processing
    const composer = new EffectComposer(newRenderer);
    const renderPass = new RenderPass(newScene, newCamera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, 0.4, 0.85
    );
    composer.addPass(bloomPass);

    // Create star core
    const starGeometry = new THREE.SphereGeometry(currentStage.radius, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: currentStage.color,
      emissive: currentStage.color,
      emissiveIntensity: 1
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    newScene.add(star);

    // Create particle system
    const particles = createParticleSystem(currentStage);
    newScene.add(particles);

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setComposer(composer);
    setControls(newControls);
    setStarMesh(star);
    setParticleSystem(particles);

    return () => {
      newRenderer.dispose();
      containerRef.current?.removeChild(newRenderer.domElement);
    };
  }, []);

  // Handle stage changes
  useEffect(() => {
    if (!scene || !starMesh || !particleSystem) return;

    // Update star appearance
    const starMaterial = starMesh.material as THREE.MeshBasicMaterial;
    starMaterial.color.set(currentStage.color);
    starMaterial.emissive.set(currentStage.color);
    starMesh.scale.setScalar(currentStage.radius);

    // Update particle system
    scene.remove(particleSystem);
    const newParticles = createParticleSystem(currentStage);
    scene.add(newParticles);
    setParticleSystem(newParticles);

  }, [currentStage, scene, starMesh]);

  // Enhanced animation loop
  useEffect(() => {
    if (!scene || !camera || !composer || !controls || !starMesh || !particleSystem) return;

    const animate = () => {
      time.current += 0.016;

      // Update shader uniforms
      const material = particleSystem.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = time.current;

      // Stage-specific animations
      switch(currentStage.name) {
        case "Protostar":
          animateProtostar(starMesh, particleSystem, time.current);
          break;
        case "Main Sequence":
          animateMainSequence(starMesh, particleSystem, time.current);
          break;
        case "Red Giant":
          animateRedGiant(starMesh, particleSystem, time.current);
          break;
        case "Supernova":
          animateSupernova(starMesh, particleSystem, time.current);
          break;
        default:
          animateBlackHole(starMesh, particleSystem, time.current);
      }

      controls.update();
      composer.render();
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [scene, camera, composer, controls, starMesh, particleSystem, currentStage]);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 space-y-4 z-10">
        <Card className="p-4 bg-black/50 backdrop-blur-sm w-80">
          <h2 className="text-lg font-semibold mb-4">Stellar Evolution</h2>
          <div className="space-y-4">
            {starStages.map((stage) => (
              <Button
                key={stage.name}
                onClick={() => setCurrentStage(stage)}
                variant={currentStage.name === stage.name ? "default" : "secondary"}
                className="w-full justify-start"
              >
                {stage.name}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-black/50 backdrop-blur-sm w-80">
          <h3 className="font-semibold mb-2">{currentStage.name}</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Temperature:</span> {currentStage.temperature.toLocaleString()}K</p>
            <p><span className="text-muted-foreground">Radius:</span> {currentStage.radius} solar radii</p>
            <p><span className="text-muted-foreground">Lifetime:</span> {currentStage.lifetime}</p>
            <p className="mt-4">{currentStage.description}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Animation functions
function animateProtostar(star: THREE.Mesh, particles: THREE.Points, time: number) {
  // Implement protostar-specific animations
  const positions = particles.geometry.attributes.position.array as Float32Array;
  const sizes = particles.geometry.attributes.size.array as Float32Array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    const angle = Math.atan2(z, x) + 0.001;
    const radius = Math.sqrt(x * x + z * z);
    
    positions[i] = radius * Math.cos(angle);
    positions[i + 2] = radius * Math.sin(angle);
    
    const sizeIndex = i / 3;
    sizes[sizeIndex] = Math.random() * 2.5 + 0.5;
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.size.needsUpdate = true;
  star.rotation.y += 0.001;
}

function animateMainSequence(star: THREE.Mesh, particles: THREE.Points, time: number) {
  // Implement main sequence animations
  const positions = particles.geometry.attributes.position.array as Float32Array;
  const sizes = particles.geometry.attributes.size.array as Float32Array;

  for (let i = 0; i < sizes.length; i++) {
    sizes[i] *= 0.99;
    if (sizes[i] < 0.5) sizes[i] = Math.random() * 2.5 + 0.5;
  }

  particles.geometry.attributes.size.needsUpdate = true;
  star.rotation.y += 0.0005;
}

function animateRedGiant(star: THREE.Mesh, particles: THREE.Points, time: number) {
  // Implement red giant animations
  const positions = particles.geometry.attributes.position.array as Float32Array;
  
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += (Math.random() - 0.5) * 0.1;
    positions[i + 1] += (Math.random() - 0.5) * 0.1;
    positions[i + 2] += (Math.random() - 0.5) * 0.1;
  }

  particles.geometry.attributes.position.needsUpdate = true;
  star.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05);
}

function animateSupernova(star: THREE.Mesh, particles: THREE.Points, time: number) {
  // Implement supernova animations
  const positions = particles.geometry.attributes.position.array as Float32Array;
  const sizes = particles.geometry.attributes.size.array as Float32Array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const distance = Math.sqrt(x * x + y * y + z * z);
    const speed = Math.min(distance * 0.1, 2.0);
    
    positions[i] += (x / distance) * speed;
    positions[i + 1] += (y / distance) * speed;
    positions[i + 2] += (z / distance) * speed;
    
    const sizeIndex = i / 3;
    sizes[sizeIndex] *= 0.99;
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.size.needsUpdate = true;
  star.scale.setScalar(Math.max(0.01, 1 - time * 0.1));
}

function animateBlackHole(star: THREE.Mesh, particles: THREE.Points, time: number) {
  // Implement black hole animations
  const positions = particles.geometry.attributes.position.array as Float32Array;
  const sizes = particles.geometry.attributes.size.array as Float32Array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const distance = Math.sqrt(x * x + z * z);
    
    const angle = Math.atan2(z, x) + (0.02 / Math.max(distance, 1));
    positions[i] = distance * Math.cos(angle);
    positions[i + 2] = distance * Math.sin(angle);
    
    const totalDistance = Math.sqrt(x * x + y * y + z * z);
    const pullStrength = 0.1 / (totalDistance + 0.1);
    
    positions[i] *= (1 - pullStrength);
    positions[i + 1] *= (1 - pullStrength);
    positions[i + 2] *= (1 - pullStrength);
    
    if (totalDistance < 0.5) {
      const newRadius = 10 + Math.random() * 20;
      const newTheta = Math.random() * Math.PI * 2;
      positions[i] = newRadius * Math.cos(newTheta);
      positions[i + 1] = (Math.random() - 0.5) * 0.3;
      positions[i + 2] = newRadius * Math.sin(newTheta);
      sizes[i / 3] = Math.random() * 2.0;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.size.needsUpdate = true;
}

export default StellarSimulation;
