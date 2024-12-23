import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

const Asteroid = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create asteroid
    const asteroidGeometry = new THREE.IcosahedronGeometry(5, 1);
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.1,
    });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    scene.add(asteroid);

    // Deform asteroid vertices for more realistic shape
    const positions = asteroidGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      positions.setXYZ(
        i,
        x + (Math.random() - 0.5),
        y + (Math.random() - 0.5),
        z + (Math.random() - 0.5)
      );
    }
    positions.needsUpdate = true;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    camera.position.z = 15;

    const animate = () => {
      requestAnimationFrame(animate);
      
      asteroid.rotation.x += 0.002;
      asteroid.rotation.y += 0.003;
      
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="min-h-screen bg-space-black text-white">
      <div ref={containerRef} className="absolute inset-0 -z-10" />
      
      <div className="relative pt-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold mb-6">The Harbinger</h1>
          <p className="text-xl text-gray-300 mb-8">
            A massive asteroid composed of light-absorbing materials approaches Earth on a collision course. Its arrival could trigger devastating global conflict, unless humanity can heed the warnings from their future selves.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Asteroid;