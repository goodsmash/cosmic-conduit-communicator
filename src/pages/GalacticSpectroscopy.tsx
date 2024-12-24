import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface SpectralData {
  wavelength: number;
  intensity: number;
  element: string;
  temperature: number;
}

const GalacticSpectroscopy = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulated spectral data
  const spectralData: SpectralData[] = [
    { wavelength: 2.05, intensity: 0.8, element: 'He', temperature: 12000 },
    { wavelength: 2.10, intensity: 0.9, element: 'H2', temperature: 100 },
    { wavelength: 2.15, intensity: 1.0, element: 'H', temperature: 10000 },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);

    // Create galaxy particles
    const particleCount = 50000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Create spiral galaxy shape
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 50;
      const spiralOffset = (radius / 50) * Math.PI * 2;
      
      positions[i * 3] = Math.cos(angle + spiralOffset) * radius;
      positions[i * 3 + 1] = Math.sin(angle + spiralOffset) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Color gradient from blue to red based on radius
      const colorRatio = radius / 50;
      colors[i * 3] = Math.min(1, colorRatio * 1.5); // Red
      colors[i * 3 + 1] = Math.max(0, 1 - colorRatio); // Green
      colors[i * 3 + 2] = Math.max(0, 1 - colorRatio * 1.2); // Blue
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Add points of interest
    const poiGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const poiMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 });
    
    const pois = [
      { x: 20, y: 10, z: 0 },
      { x: -15, y: -8, z: 2 },
      { x: 0, y: 25, z: -1 },
    ].map(pos => {
      const poi = new THREE.Mesh(poiGeometry, poiMaterial);
      poi.position.set(pos.x, pos.y, pos.z);
      scene.add(poi);
      return poi;
    });

    camera.position.z = 100;

    // Draw spectral graph on canvas
    const drawSpectralGraph = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const canvas = canvasRef.current;
      canvas.width = window.innerWidth * 0.8;
      canvas.height = 200;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw spectral lines
      ctx.lineWidth = 2;
      spectralData.forEach((data, index) => {
        const x = (data.wavelength - 2.0) * 1000;
        const y = canvas.height - (data.intensity * canvas.height * 0.8);

        // Draw emission line
        ctx.strokeStyle = data.temperature > 5000 ? '#ff3333' : '#3333ff';
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(data.element, x - 10, y - 10);
      });
    };

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      particleSystem.rotation.z += 0.001;
      pois.forEach(poi => {
        poi.rotation.y += 0.01;
      });
      renderer.render(scene, camera);
    };

    animate();
    drawSpectralGraph();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      drawSpectralGraph();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-8 w-full"
      >
        <canvas 
          ref={canvasRef} 
          className="mx-auto"
        />
        <div className="text-center text-white mt-4">
          <h2 className="text-2xl font-bold mb-2">Spectral Analysis</h2>
          <p className="text-sm opacity-80">
            Wavelength (microns) vs Intensity
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center text-white"
      >
        <h1 className="text-4xl font-bold mb-4">Distant Galaxy Spectroscopy</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Analyzing molecular composition and temperature variations in distant galaxies
          through spectroscopic observations.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute top-1/2 right-8 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-6 rounded-lg"
      >
        <h3 className="text-xl font-bold mb-4">Detected Elements</h3>
        <ul className="space-y-2">
          {spectralData.map((data, index) => (
            <li key={index} className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                data.temperature > 5000 ? 'bg-red-500' : 'bg-blue-500'
              }`}></span>
              <span>{data.element} - {data.temperature}K</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default GalacticSpectroscopy;
