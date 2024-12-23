import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

const BlackHole = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create black hole
    const blackHoleGeometry = new THREE.SphereGeometry(5, 32, 32);
    const blackHoleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
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
        varying vec2 vUv;
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          float alpha = smoothstep(0.5, 0.0, dist);
          vec3 color = mix(vec3(0.0), vec3(0.2, 0.4, 1.0), dist * 2.0);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true
    });
    
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    scene.add(blackHole);

    // Add accretion disk
    const diskGeometry = new THREE.TorusGeometry(8, 1, 16, 100);
    const diskMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4A90E2,
      emissive: 0x2A50A2,
      transparent: true,
      opacity: 0.8
    });
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.rotation.x = Math.PI / 2;
    scene.add(disk);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x4A90E2, 2, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 20;

    const animate = () => {
      requestAnimationFrame(animate);
      
      blackHole.rotation.y += 0.005;
      disk.rotation.z += 0.002;
      
      blackHoleMaterial.uniforms.time.value += 0.01;
      
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
          <h1 className="text-5xl font-bold mb-6">The Event Horizon</h1>
          <p className="text-xl text-gray-300 mb-8">
            As we approach the point of no return, the very fabric of spacetime begins to warp and twist. The Event Horizon marks the boundary between what was and what could be - a threshold that, once crossed, changes everything.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BlackHole;