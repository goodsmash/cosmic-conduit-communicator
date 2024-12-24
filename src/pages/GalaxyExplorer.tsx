import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface GalaxyType {
  name: string;
  type: 'spiral' | 'elliptical' | 'irregular' | 'merger';
  description: string;
  color: {
    core: string;
    arms: string;
    dust: string;
    starFormation: string;
  };
  parameters: {
    size: number;
    armCount: number;
    dustDensity: number;
    starFormationRate: number;
  };
}

const galaxyTypes: GalaxyType[] = [
  {
    name: 'Spiral Galaxy',
    type: 'spiral',
    description: 'A magnificent spiral galaxy with prominent star-forming regions and dust lanes.',
    color: {
      core: '#ffdb8c',
      arms: '#ff6b6b',
      dust: '#4a90e2',
      starFormation: '#ff4757'
    },
    parameters: {
      size: 50,
      armCount: 4,
      dustDensity: 0.5,
      starFormationRate: 0.7
    }
  },
  {
    name: 'Merging Galaxies',
    type: 'merger',
    description: 'Two galaxies in the process of merging, creating dramatic tidal forces and intense star formation.',
    color: {
      core: '#ffd700',
      arms: '#ff4757',
      dust: '#2f3542',
      starFormation: '#ff6348'
    },
    parameters: {
      size: 40,
      armCount: 2,
      dustDensity: 0.8,
      starFormationRate: 0.9
    }
  },
  {
    name: 'Elliptical Galaxy',
    type: 'elliptical',
    description: 'An ancient elliptical galaxy dominated by older stars and less active star formation.',
    color: {
      core: '#ffeaa7',
      arms: '#fab1a0',
      dust: '#636e72',
      starFormation: '#fd79a8'
    },
    parameters: {
      size: 60,
      armCount: 0,
      dustDensity: 0.2,
      starFormationRate: 0.3
    }
  }
];

const GalaxyExplorer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyType>(galaxyTypes[0]);
  const [cameraDistance, setCameraDistance] = useState(150);
  const [rotationSpeed, setRotationSpeed] = useState(0.0005);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 300;

    // Create star field
    const createStarField = () => {
      const geometry = new THREE.BufferGeometry();
      const count = 10000;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 1000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        const starColor = new THREE.Color();
        starColor.setHSL(Math.random(), 0.2, 0.8);
        colors[i3] = starColor.r;
        colors[i3 + 1] = starColor.g;
        colors[i3 + 2] = starColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
      });

      return new THREE.Points(geometry, material);
    };

    // Create galaxy core
    const createGalaxyCore = () => {
      const geometry = new THREE.SphereGeometry(selectedGalaxy.parameters.size * 0.2, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(selectedGalaxy.color.core) }
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
          uniform vec3 color;
          uniform float time;
          varying vec3 vNormal;
          varying vec2 vUv;
          
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
            gl_FragColor = vec4(color, 1.0) * intensity;
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      return new THREE.Mesh(geometry, material);
    };

    // Create spiral arms
    const createSpiralArms = () => {
      const points = new THREE.Group();
      const particleCount = 50000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const armColor = new THREE.Color(selectedGalaxy.color.arms);
      const arms = selectedGalaxy.parameters.armCount;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * selectedGalaxy.parameters.size;
        const armAngle = (i % arms) * ((Math.PI * 2) / arms);
        const spiralAngle = radius * 0.75;
        const angle = armAngle + spiralAngle;

        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = Math.sin(angle) * radius;
        positions[i3 + 2] = (Math.random() - 0.5) * 10;

        colors[i3] = armColor.r;
        colors[i3 + 1] = armColor.g;
        colors[i3 + 2] = armColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      return new THREE.Points(geometry, material);
    };

    // Create all components
    const starField = createStarField();
    const galaxyCore = createGalaxyCore();
    const spiralArms = createSpiralArms();

    scene.add(starField);
    scene.add(galaxyCore);
    scene.add(spiralArms);

    // Position camera
    camera.position.z = cameraDistance;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      controls.update();
      
      galaxyCore.rotation.y += rotationSpeed;
      spiralArms.rotation.y += rotationSpeed;
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [selectedGalaxy, cameraDistance, rotationSpeed]);

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center text-white z-10"
      >
        <h1 className="text-5xl font-bold mb-4 text-blue-400">
          {selectedGalaxy.name}
        </h1>
        <p className="text-xl max-w-2xl mx-auto text-gray-300">
          {selectedGalaxy.description}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-6 rounded-lg text-white z-10"
      >
        <h3 className="text-xl font-bold mb-4">Galaxy Types</h3>
        <div className="space-y-4">
          {galaxyTypes.map((galaxy, index) => (
            <button
              key={index}
              className={`block w-full text-left px-4 py-2 rounded ${
                selectedGalaxy.name === galaxy.name 
                  ? 'bg-blue-600' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedGalaxy(galaxy)}
            >
              {galaxy.name}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h4 className="font-bold mb-2">Controls</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Rotation Speed</label>
              <input
                type="range"
                min="0"
                max="0.002"
                step="0.0001"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <p className="text-sm text-gray-400">
              Mouse drag to rotate<br/>
              Scroll to zoom
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GalaxyExplorer;
