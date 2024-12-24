import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

// Constants for black hole physics
const SCHWARZSCHILD_RADIUS = 2.5; // Event horizon radius
const G = 6.674e-11; // Gravitational constant
const C = 299792458; // Speed of light
const MASS = 1e6; // Mass of black hole in solar masses

// Helper functions for relativistic effects
const calculateGravitationalRedshift = (r: number) => {
  return 1 / Math.sqrt(1 - SCHWARZSCHILD_RADIUS / r);
};

const calculateTimeDialation = (r: number) => {
  return Math.sqrt(1 - SCHWARZSCHILD_RADIUS / r);
};

const calculateLightBending = (r: number, angle: number) => {
  const impact = r * Math.sin(angle);
  const bend = (2 * G * MASS) / (impact * C * C);
  return bend;
};

const BlackHole = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with larger dimensions
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create accretion disk with realistic physics
    const particleCount = 15000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const temperatures = new Float32Array(particleCount);

    // Color calculation based on temperature (blackbody radiation)
    const calculateBlackbodyColor = (temp: number) => {
      const x = temp / 10000;
      const r = Math.min(1, Math.max(0, 1.5 - Math.abs(x - 0.5)));
      const g = Math.min(1, Math.max(0, 1 - Math.abs(x - 1)));
      const b = Math.min(1, Math.max(0, 2 - x));
      return new THREE.Color(r, g, b);
    };

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = (Math.random() * 8 + SCHWARZSCHILD_RADIUS) * (1 + Math.random() * 0.3);
      const heightOffset = (Math.random() - 0.5) * (radius * 0.1);
      
      // Calculate orbital velocity based on radius (Kepler's laws)
      const orbitalVelocity = Math.sqrt(G * MASS / radius);
      const relativistic_factor = calculateTimeDialation(radius);
      
      // Spiral pattern with relativistic corrections
      const spiralOffset = Math.log(radius) * 2;
      positions[i * 3] = Math.cos(angle + spiralOffset) * radius;
      positions[i * 3 + 1] = Math.sin(angle + spiralOffset) * radius;
      positions[i * 3 + 2] = heightOffset * relativistic_factor;

      // Store velocities for animation
      velocities[i * 3] = -Math.sin(angle) * orbitalVelocity;
      velocities[i * 3 + 1] = Math.cos(angle) * orbitalVelocity;
      velocities[i * 3 + 2] = 0;

      // Temperature varies with radius (hotter closer to black hole)
      const temp = 10000 * (SCHWARZSCHILD_RADIUS / radius);
      temperatures[i] = temp;
      const color = calculateBlackbodyColor(temp);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Particle size based on temperature and relativistic effects
      sizes[i] = (Math.random() * 0.1 + 0.05) * calculateGravitationalRedshift(radius);
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particles.setAttribute('temperature', new THREE.BufferAttribute(temperatures, 1));

    // Advanced shader for particles with relativistic effects
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        schwarzschildRadius: { value: SCHWARZSCHILD_RADIUS },
      },
      vertexShader: `
        attribute float size;
        attribute float temperature;
        varying vec3 vColor;
        varying float vTemperature;
        uniform float time;
        uniform float schwarzschildRadius;

        void main() {
          vColor = color;
          vTemperature = temperature;
          
          // Apply relativistic position warping
          vec3 pos = position;
          float dist = length(pos.xy);
          float warpFactor = 1.0 - (schwarzschildRadius / dist);
          pos.xy *= warpFactor;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (1000.0 / -mvPosition.z) * warpFactor;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vTemperature;
        
        void main() {
          float r = distance(gl_PointCoord, vec2(0.5));
          if (r > 0.5) discard;
          
          // Temperature-based glow
          float glow = 1.0 - (r * 2.0);
          vec3 finalColor = vColor * (1.0 + (vTemperature / 10000.0) * glow);
          gl_FragColor = vec4(finalColor, glow);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Event horizon with gravitational lensing effect
    const blackHoleGeometry = new THREE.SphereGeometry(SCHWARZSCHILD_RADIUS, 64, 64);
    const blackHoleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        radius: { value: SCHWARZSCHILD_RADIUS },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float radius;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Gravitational lensing effect
          float warpFactor = 1.0 - (radius / (dist * 10.0));
          float alpha = smoothstep(0.4, 0.1, dist) * warpFactor;
          
          // Event horizon darkness
          vec3 color = vec3(0.0);
          float rimLight = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 4.0);
          color += vec3(0.1, 0.0, 0.0) * rimLight;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    scene.add(blackHole);

    // Gravitational lens effect (distortion of background)
    const lensGeometry = new THREE.PlaneGeometry(40, 40, 100, 100);
    const lensShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        radius: { value: SCHWARZSCHILD_RADIUS },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float radius;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Gravitational lensing distortion
          float bend = radius / (dist * 10.0);
          vec3 color = vec3(0.0);
          float stars = fract(sin(vUv.x * 1000.0 + vUv.y * 2000.0) * 10000.0);
          stars = step(0.999, stars) * (1.0 - bend);
          
          color = vec3(stars);
          gl_FragColor = vec4(color, 0.5);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const lensPlane = new THREE.Mesh(lensGeometry, lensShader);
    lensPlane.position.z = -10;
    scene.add(lensPlane);

    // Position camera
    camera.position.z = 20;

    // Animation loop with physics calculations
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.001;

      // Update particle positions based on velocities and gravitational effects
      const positions = particles.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const x = positions[idx];
        const y = positions[idx + 1];
        const z = positions[idx + 2];
        
        const radius = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        
        // Apply relativistic corrections
        const timeDialation = calculateTimeDialation(radius);
        const orbitalVelocity = Math.sqrt(G * MASS / radius) * timeDialation;
        
        // Update positions with velocity and gravitational effects
        positions[idx] = Math.cos(angle + orbitalVelocity * time) * radius;
        positions[idx + 1] = Math.sin(angle + orbitalVelocity * time) * radius;
        positions[idx + 2] = z * Math.exp(-time * 0.1); // Gradual collapse to disk
      }
      particles.attributes.position.needsUpdate = true;

      // Update shaders
      particleMaterial.uniforms.time.value = time;
      blackHoleMaterial.uniforms.time.value = time;
      lensShader.uniforms.time.value = time;

      // Camera movement
      camera.position.x = Math.sin(time * 0.1) * 2;
      camera.position.y = Math.cos(time * 0.1) * 2;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 pointer-events-none"
      >
        <h1 className="text-6xl font-bold mb-6 text-red-500 tracking-wider">The Event Horizon</h1>
        <p className="text-2xl max-w-3xl text-yellow-100 leading-relaxed">
          As we approach the point of no return, the very fabric of spacetime begins to warp and twist. 
          The Event Horizon marks the boundary between what was and what could be - a threshold that, 
          once crossed, changes everything.
        </p>
      </motion.div>
    </div>
  );
};

export default BlackHole;