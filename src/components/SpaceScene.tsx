import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SpaceScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Add nebula
    const nebulaGeometry = new THREE.SphereGeometry(100, 32, 32);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x4A90E2,
      transparent: true,
      opacity: 0.1,
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    camera.position.z = 500;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0002;
      nebula.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
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

  return <div ref={containerRef} className="absolute inset-0 -z-0" />;
};

export default SpaceScene;